import React, {
  FC,
  useEffect,
  useState,
  useCallback,
  ReactNode,
  useMemo,
} from 'react'
import {
  useTokens,
  useCoinConversion,
  useReservoirClient,
  useTokenOpenseaBanned,
  useCollections,
  useListings,
  useChainCurrency,
} from '../../hooks'
import { useAccount, useBalance, useWalletClient, useNetwork } from 'wagmi'

import { Execute, ReservoirClientActions } from '@reservoir0x/reservoir-sdk'
import { UseBalanceToken } from '../../types/wagmi'
import { toFixed } from '../../lib/numbers'
import { formatUnits, parseUnits, zeroAddress } from 'viem'
import { Currency } from '../../types/Currency'

export enum BuyStep {
  Checkout,
  Approving,
  AddFunds,
  Complete,
  Unavailable,
}

export type BuyModalStepData = {
  totalSteps: number
  stepProgress: number
  currentStep: Execute['steps'][0]
  currentStepItem: NonNullable<Execute['steps'][0]['items']>[0]
}

type Token = NonNullable<NonNullable<ReturnType<typeof useTokens>>['data']>[0]

type ChildrenProps = {
  loading: boolean
  token?: Token
  collection?: NonNullable<ReturnType<typeof useCollections>['data']>[0]
  listing?: NonNullable<ReturnType<typeof useListings>['data']>[0]
  quantityAvailable: number
  averageUnitPrice: number
  currency?: NonNullable<
    NonNullable<
      NonNullable<
        NonNullable<NonNullable<Token>['market']>['floorAsk']
      >['price']
    >['currency']
  >
  mixedCurrencies: boolean
  totalPrice: number
  feeOnTop: number
  buyStep: BuyStep
  transactionError?: Error | null
  hasEnoughCurrency: boolean
  feeUsd: number
  totalUsd: number
  usdPrice: number
  isBanned: boolean
  balance?: bigint
  address?: string
  blockExplorerBaseUrl: string
  steps: Execute['steps'] | null
  stepData: BuyModalStepData | null
  quantity: number
  listingsToBuy: Record<string, number>
  setBuyStep: React.Dispatch<React.SetStateAction<BuyStep>>
  setQuantity: React.Dispatch<React.SetStateAction<number>>
  buyToken: () => void
}

type Props = {
  open: boolean
  tokenId?: string
  collectionId?: string
  orderId?: string
  feesOnTopBps?: string[] | null
  feesOnTopFixed?: string[] | null
  normalizeRoyalties?: boolean
  children: (props: ChildrenProps) => ReactNode
}

export const BuyModalRenderer: FC<Props> = ({
  open,
  tokenId,
  collectionId,
  orderId,
  feesOnTopBps,
  feesOnTopFixed,
  normalizeRoyalties,
  children,
}) => {
  const { data: signer } = useWalletClient()
  const [totalPrice, setTotalPrice] = useState(0)
  const [averageUnitPrice, setAverageUnitPrice] = useState(0)
  const [listingsToBuy, setListingsToBuy] = useState<Record<string, number>>({})
  const [currency, setCurrency] = useState<undefined | Currency>()
  const [mixedCurrencies, setMixedCurrencies] = useState(false)
  const [feeOnTop, setFeeOnTop] = useState(0)
  const [buyStep, setBuyStep] = useState<BuyStep>(BuyStep.Checkout)
  const [transactionError, setTransactionError] = useState<Error | null>()
  const [hasEnoughCurrency, setHasEnoughCurrency] = useState(true)
  const [stepData, setStepData] = useState<BuyModalStepData | null>(null)
  const [steps, setSteps] = useState<Execute['steps'] | null>(null)
  const [quantity, setQuantity] = useState(1)
  const { chain: activeChain } = useNetwork()
  const chainCurrency = useChainCurrency()
  const blockExplorerBaseUrl =
    activeChain?.blockExplorers?.default?.url || 'https://etherscan.io'

  const contract = collectionId ? collectionId?.split(':')[0] : undefined

  const { data: tokens, mutate: mutateTokens } = useTokens(
    open && {
      tokens: [`${contract}:${tokenId}`],
      includeLastSale: true,
      normalizeRoyalties,
    },
    {
      revalidateFirstPage: true,
    }
  )
  const { data: collections, mutate: mutateCollection } = useCollections(
    open && {
      id: collectionId,
      normalizeRoyalties,
    }
  )
  const { address } = useAccount()
  const { data: balance } = useBalance({
    address: address,
    token:
      currency?.contract !== zeroAddress
        ? (currency?.contract as UseBalanceToken)
        : undefined,
    watch: open,
    formatUnits: currency?.decimals,
  })

  const collection = collections && collections[0] ? collections[0] : undefined
  const token = tokens && tokens.length > 0 ? tokens[0] : undefined
  const is1155 = token?.token?.kind === 'erc1155'
  let listingOrderId = orderId && orderId.length > 0 ? orderId : undefined

  if (!listingOrderId && !is1155) {
    listingOrderId = token?.market?.floorAsk?.id
  }

  const {
    data: listingsData,
    mutate: mutateListings,
    isValidating: isValidatingListing,
  } = useListings(
    {
      token: `${contract}:${tokenId}`,
      ids: listingOrderId,
      normalizeRoyalties,
      status: 'active',
      limit: 1000,
      sortBy: 'price',
    },
    {
      revalidateFirstPage: true,
    },
    open && (token?.market?.floorAsk?.id !== undefined || orderId)
      ? true
      : false
  )

  const listings = useMemo(
    () => listingsData.filter((listing) => listing.maker !== address),
    [listingsData]
  )
  const listing =
    listings && listings[0] && listings[0].status === 'active'
      ? listings[0]
      : undefined
  const quantityRemaining =
    listings.length > 1
      ? listings.reduce(
          (total, listing) => total + (listing.quantityRemaining || 0),
          0
        )
      : listing?.quantityRemaining

  const usdConversion = useCoinConversion(
    open && token ? 'USD' : undefined,
    currency?.symbol
  )
  const usdPrice = usdConversion.length > 0 ? usdConversion[0].price : 0
  const feeUsd = feeOnTop * usdPrice
  const totalUsd = totalPrice * usdPrice

  const client = useReservoirClient()

  const buyToken = useCallback(() => {
    if (!signer) {
      const error = new Error('Missing a signer')
      setTransactionError(error)
      throw error
    }

    if (!tokenId || !collectionId) {
      const error = new Error('Missing tokenId or collectionId')
      setTransactionError(error)
      throw error
    }

    if (!client) {
      const error = new Error('ReservoirClient was not initialized')
      setTransactionError(error)
      throw error
    }

    const contract = collectionId?.split(':')[0]

    let options: Parameters<
      ReservoirClientActions['buyToken']
    >['0']['options'] = {}

    if (feesOnTopFixed && feesOnTopFixed.length > 0) {
      options.feesOnTop = feesOnTopFixed
    } else if (feesOnTopBps && feesOnTopBps?.length > 0) {
      const fixedFees = feesOnTopBps.map((fullFee) => {
        const [referrer, feeBps] = fullFee.split(':')
        const totalFeeTruncated = toFixed(
          totalPrice - feeOnTop,
          currency?.decimals || 18
        )
        const fee =
          Number(
            parseUnits(
              `${Number(totalFeeTruncated)}`,
              currency?.decimals || 18
            ) * BigInt(feeBps)
          ) / 10000
        const atomicUnitsFee = formatUnits(BigInt(fee), 0)
        return `${referrer}:${atomicUnitsFee}`
      })
      options.feesOnTop = fixedFees
    } else if (!feesOnTopFixed && !feesOnTopBps) {
      delete options.feesOnTop
    }

    if (normalizeRoyalties !== undefined) {
      options.normalizeRoyalties = normalizeRoyalties
    }

    setBuyStep(BuyStep.Approving)
    type Item = Parameters<ReservoirClientActions['buyToken']>['0']['items'][0]
    const items: Item[] = []

    if (quantity > 1) {
      Object.keys(listingsToBuy).forEach((listingId) => {
        items.push({
          orderId: listingId,
          quantity: listingsToBuy[listingId],
        })
      })
    } else {
      const item: Item = {
        quantity: 1,
      }

      if (orderId) {
        item.orderId = orderId
      } else {
        item.token = `${contract}:${tokenId}`
      }
      items.push(item)
    }

    client.actions
      .buyToken({
        items: items,
        expectedPrice: totalPrice - feeOnTop,
        signer,
        onProgress: (steps: Execute['steps']) => {
          if (!steps) {
            return
          }
          setSteps(steps)

          const executableSteps = steps.filter(
            (step) => step.items && step.items.length > 0
          )

          let stepCount = executableSteps.length

          let currentStepItem:
            | NonNullable<Execute['steps'][0]['items']>[0]
            | undefined

          const currentStepIndex = executableSteps.findIndex((step) => {
            currentStepItem = step.items?.find(
              (item) => item.status === 'incomplete'
            )
            return currentStepItem
          })

          const currentStep =
            currentStepIndex > -1
              ? executableSteps[currentStepIndex]
              : executableSteps[stepCount - 1]

          if (currentStepItem) {
            setStepData({
              totalSteps: stepCount,
              stepProgress: currentStepIndex,
              currentStep,
              currentStepItem,
            })
          } else if (
            steps.every(
              (step) =>
                !step.items ||
                step.items.length == 0 ||
                step.items?.every((item) => item.status === 'complete')
            )
          ) {
            setBuyStep(BuyStep.Complete)
          }
        },
        options,
      })
      .catch((e: any) => {
        const error = e as Error
        if (error && error?.message && error?.message.includes('ETH balance')) {
          setHasEnoughCurrency(false)
        } else {
          const errorType = (error as any)?.type
          const errorStatus = (error as any)?.statusCode
          let message = 'Oops, something went wrong. Please try again.'
          if (errorType && errorType === 'price mismatch') {
            message = error.message
          }
          if (errorStatus >= 400 && errorStatus < 500) {
            message = error.message
          }
          //@ts-ignore: Should be fixed in an update to typescript
          const transactionError = new Error(message, {
            cause: error,
          })
          setTransactionError(transactionError)
          if (orderId) {
            mutateListings()
          }
          mutateCollection()
          mutateTokens()
        }
        setBuyStep(BuyStep.Checkout)
        setStepData(null)
        setSteps(null)
      })
  }, [
    tokenId,
    collectionId,
    orderId,
    feesOnTopBps,
    feesOnTopFixed,
    quantity,
    normalizeRoyalties,
    client,
    currency,
    totalPrice,
    listingsToBuy,
    mutateListings,
    mutateTokens,
    mutateCollection,
  ])

  useEffect(() => {
    let currency: Currency | undefined
    if (listing) {
      let total = 0
      if (quantity > 1) {
        let orders: Record<string, number> = {}
        let mixedCurrencies = false
        let currencies: string[] = []
        let nativeTotal = 0
        let orderCurrencyTotal = 0
        let totalQuantity = 0
        for (let i = 0; i < listings.length; i++) {
          const listingQuantity = listings[i].quantityRemaining
          const listingPrice = listings[i].price
          const listingAmount = listingPrice?.amount
          const listingId = listings[i].id
          if (
            !listingPrice?.currency?.contract ||
            !listingAmount ||
            !listingQuantity
          ) {
            continue
          }
          const quantityLeft = quantity - totalQuantity
          if (!currencies.includes(listingPrice.currency.contract)) {
            currencies.push(listingPrice.currency.contract)
            mixedCurrencies = currencies.length >= 2
          }
          let quantityToTake = 0
          if (quantityLeft >= listingQuantity) {
            quantityToTake = listingQuantity
          } else {
            quantityToTake = quantityLeft
          }

          nativeTotal += (listingAmount.native || 0) * quantityToTake
          orderCurrencyTotal += (listingAmount.decimal || 0) * quantityToTake
          orders[listingId] = quantityToTake
          totalQuantity += quantityToTake

          if (totalQuantity === quantity) {
            break
          }
        }
        total = mixedCurrencies ? nativeTotal : orderCurrencyTotal
        setListingsToBuy(orders)
        currency = mixedCurrencies
          ? {
              contract: chainCurrency.address,
              symbol: chainCurrency.symbol,
              decimals: chainCurrency.decimals,
              name: chainCurrency.name,
            }
          : (listing.price?.currency as any)
        setCurrency(currency)
        setMixedCurrencies(mixedCurrencies)
      } else if (listing.price?.amount?.decimal) {
        total = listing.price.amount.decimal
        currency = listing.price.currency as Currency
        setCurrency(currency)
        setMixedCurrencies(false)
      }
      if (total > 0) {
        if (feesOnTopBps && feesOnTopBps.length > 0) {
          const fees = feesOnTopBps.reduce((totalFees, feeOnTop) => {
            const [_, fee] = feeOnTop.split(':')
            return totalFees + (Number(fee) / 10000) * total
          }, 0)
          total += fees
          setFeeOnTop(fees)
        } else if (feesOnTopFixed && feesOnTopFixed.length > 0) {
          const fees = feesOnTopFixed.reduce((totalFees, feeOnTop) => {
            const [_, fee] = feeOnTop.split(':')
            const parsedFee = formatUnits(BigInt(fee), currency?.decimals || 18)
            return totalFees + Number(parsedFee)
          }, 0)
          total += fees
          setFeeOnTop(fees)
        }
        setTotalPrice(total)
        setAverageUnitPrice(total / quantity)
        setBuyStep(BuyStep.Checkout)
      } else {
        setBuyStep(BuyStep.Unavailable)
        setTotalPrice(0)
        setAverageUnitPrice(0)
        setListingsToBuy({})
        setCurrency(undefined)
        setMixedCurrencies(false)
      }
    } else if (!listing && !isValidatingListing && token) {
      setBuyStep(BuyStep.Unavailable)
      setTotalPrice(0)
      setAverageUnitPrice(0)
      setListingsToBuy({})
      setCurrency(undefined)
      setMixedCurrencies(false)
    }
  }, [
    listing,
    isValidatingListing,
    feesOnTopBps,
    feesOnTopFixed,
    feeOnTop,
    client,
    quantity,
    token,
    chainCurrency.address,
  ])

  useEffect(() => {
    if (balance) {
      const totalPriceTruncated = toFixed(totalPrice, currency?.decimals || 18)
      if (!balance.value) {
        setHasEnoughCurrency(false)
      } else if (
        balance.value <
        parseUnits(`${totalPriceTruncated as number}`, currency?.decimals || 18)
      ) {
        setHasEnoughCurrency(false)
      } else {
        setHasEnoughCurrency(true)
      }
    }
  }, [totalPrice, balance, currency])

  useEffect(() => {
    if (!open) {
      setBuyStep(BuyStep.Checkout)
      setTransactionError(null)
      setStepData(null)
      setSteps(null)
      setQuantity(1)
    }
  }, [open])

  const isBanned = useTokenOpenseaBanned(open ? contract : undefined, tokenId)

  return (
    <>
      {children({
        loading: (!listing && isValidatingListing) || !token,
        token,
        collection,
        listing,
        quantityAvailable: quantityRemaining || 1,
        currency,
        mixedCurrencies,
        totalPrice,
        averageUnitPrice,
        feeOnTop,
        buyStep,
        transactionError,
        hasEnoughCurrency,
        feeUsd,
        totalUsd,
        usdPrice,
        isBanned,
        balance: balance?.value,
        address: address,
        blockExplorerBaseUrl,
        steps,
        stepData,
        quantity,
        listingsToBuy,
        setQuantity,
        setBuyStep,
        buyToken,
      })}
    </>
  )
}
