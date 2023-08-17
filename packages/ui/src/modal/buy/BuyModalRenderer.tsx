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
  useReservoirClient,
  useCollections,
  useListings,
  useChainCurrency,
  useCurrencyConversion,
} from '../../hooks'
import { useAccount, useBalance, useWalletClient, useNetwork } from 'wagmi'

import {
  BuyPath,
  Execute,
  ReservoirClientActions,
} from '@reservoir0x/reservoir-sdk'
import { UseBalanceToken } from '../../types/wagmi'
import { toFixed } from '../../lib/numbers'
import { formatUnits, parseUnits, zeroAddress } from 'viem'
import { Currency } from '../../types/Currency'

type Item = Parameters<ReservoirClientActions['buyToken']>['0']['items'][0]

export enum BuyStep {
  Checkout,
  Approving,
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
type BuyTokenOptions = NonNullable<
  Parameters<ReservoirClientActions['buyToken']>['0']['options']
>

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
  totalIncludingFees: number
  feeOnTop: number
  buyStep: BuyStep
  transactionError?: Error | null
  hasEnoughCurrency: boolean
  addFundsLink: string
  feeUsd: number
  totalUsd: number
  usdPrice: number
  balance?: bigint
  address?: string
  blockExplorerBaseUrl: string
  steps: Execute['steps'] | null
  stepData: BuyModalStepData | null
  quantity: number
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
  feesOnTopUsd?: string[] | null
  normalizeRoyalties?: boolean
  children: (props: ChildrenProps) => ReactNode
}

export const BuyModalRenderer: FC<Props> = ({
  open,
  tokenId,
  collectionId,
  orderId,
  feesOnTopBps,
  feesOnTopUsd,
  normalizeRoyalties,
  children,
}) => {
  const { data: wallet } = useWalletClient()
  const [totalPrice, setTotalPrice] = useState(0)
  const [totalIncludingFees, setTotalIncludingFees] = useState(0)
  const [averageUnitPrice, setAverageUnitPrice] = useState(0)
  const [path, setPath] = useState<BuyPath>([])
  const [isFetchingPath, setIsFetchingPath] = useState(false)
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
      includeQuantity: true,
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

  const {
    data: listingsData,
    mutate: mutateListings,
    isValidating: isValidatingListing,
  } = useListings(
    {
      token: `${contract}:${tokenId}`,
      ids: orderId,
      normalizeRoyalties,
      status: 'active',
      limit: 1,
      sortBy: 'price',
    },
    {
      revalidateFirstPage: true,
    },
    open && orderId && orderId.length > 0 ? true : false
  )

  const listing = useMemo(
    () => listingsData.find((listing) => listing.maker !== address),
    [listingsData]
  )

  const quantityRemaining = useMemo(() => {
    if (orderId) {
      return listing?.quantityRemaining || 0
    } else if (is1155) {
      return path
        ? path.reduce((total, pathItem) => total + (pathItem.quantity || 0), 0)
        : 0
    } else {
      return token?.market?.floorAsk?.quantityRemaining || 0
    }
  }, [listing, token, path, is1155, orderId])

  const { data: usdFeeConversion } = useCurrencyConversion(
    undefined,
    currency?.contract,
    'usd'
  )
  const usdPrice = Number(usdFeeConversion?.usd || 0)
  const feeUsd = feeOnTop * usdPrice
  const totalUsd = totalIncludingFees * usdPrice

  const client = useReservoirClient()

  const { chain } = useNetwork()

  const addFundsLink = currency?.contract
    ? `https://jumper.exchange/?toChain=${chain?.id}&toToken=${currency?.contract}`
    : `https://jumper.exchange/?toChain=${chain?.id}`

  const fetchPath = useCallback(() => {
    if (
      !open ||
      !client ||
      !tokenId ||
      !contract ||
      !wallet ||
      !is1155 ||
      orderId
    ) {
      setPath(undefined)
      return
    }

    setIsFetchingPath(true)

    const options: BuyTokenOptions = {
      onlyPath: true,
      partial: true,
    }

    if (normalizeRoyalties !== undefined) {
      options.normalizeRoyalties = normalizeRoyalties
    }

    client.actions
      .buyToken({
        options,
        items: [
          {
            token: `${contract}:${tokenId}`,
            quantity: 1000,
            fillType: 'trade',
          },
        ],
        wallet,
        onProgress: () => {},
        precheck: true,
      })
      .then((response) => {
        if (response && (response as Execute).path) {
          setPath((response as Execute).path)
        } else {
          setPath([])
        }
      })
      .catch((err) => {
        setPath([])
        throw err
      })
      .finally(() => {
        setIsFetchingPath(false)
      })
  }, [
    open,
    client,
    wallet,
    tokenId,
    contract,
    is1155,
    orderId,
    normalizeRoyalties,
  ])

  useEffect(() => {
    fetchPath()
  }, [fetchPath])

  const buyToken = useCallback(() => {
    if (!wallet) {
      const error = new Error('Missing a wallet/signer')
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

    let options: BuyTokenOptions = {
      currency: currency?.contract,
    }

    if (feesOnTopBps && feesOnTopBps?.length > 0) {
      const fixedFees = feesOnTopBps.map((fullFee) => {
        const [referrer, feeBps] = fullFee.split(':')
        const totalFeeTruncated = toFixed(
          totalIncludingFees - feeOnTop,
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
    } else if (feesOnTopUsd && feesOnTopUsd.length > 0 && usdPrice) {
      const feesOnTopFixed = feesOnTopUsd.map((feeOnTop) => {
        const [recipient, fee] = feeOnTop.split(':')
        const atomicUsdPrice = parseUnits(`${usdPrice}`, 6)
        const atomicFee = BigInt(fee)
        const convertedAtomicFee = atomicFee * BigInt(10 ** currency?.decimals!)
        const currencyFee = convertedAtomicFee / atomicUsdPrice
        const parsedFee = formatUnits(currencyFee, 0)
        return `${recipient}:${parsedFee}`
      })
      options.feesOnTop = feesOnTopFixed
    } else if (!feesOnTopUsd && !feesOnTopBps) {
      delete options.feesOnTop
    }

    if (normalizeRoyalties !== undefined) {
      options.normalizeRoyalties = normalizeRoyalties
    }

    setBuyStep(BuyStep.Approving)
    const items: Item[] = []
    const item: Item = {
      fillType: 'trade',
      quantity,
    }

    if (is1155) {
      options.partial = true
    }

    if (orderId) {
      item.orderId = orderId
    } else {
      item.token = `${contract}:${tokenId}`
    }
    items.push(item)

    client.actions
      .buyToken({
        items: items,
        expectedPrice: {
          [currency?.contract || zeroAddress]: {
            amount: totalPrice,
            raw: parseUnits(`${totalPrice}`, currency?.decimals || 18),
            currencyAddress: currency?.contract,
            currencyDecimals: currency?.decimals,
          },
        },
        wallet,
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
          fetchPath()
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
    feesOnTopUsd,
    quantity,
    normalizeRoyalties,
    is1155,
    client,
    currency,
    totalPrice,
    totalIncludingFees,
    mutateListings,
    mutateTokens,
    mutateCollection,
  ])

  useEffect(() => {
    let currency: Currency | undefined
    if (quantity === -1) return
    if (
      !token ||
      (orderId && !listing && isValidatingListing) ||
      (is1155 && !path && isFetchingPath)
    ) {
      setBuyStep(BuyStep.Unavailable)
      setTotalPrice(0)
      setTotalIncludingFees(0)
      setAverageUnitPrice(0)
      setCurrency(undefined)
      setMixedCurrencies(false)
      return
    }

    let total = 0
    if (orderId) {
      total = (listing?.price?.amount?.decimal || 0) * quantity
      if (listing?.price?.currency) {
        currency = listing?.price?.currency as Currency
        setCurrency(currency)
      }
      setMixedCurrencies(false)
    } else if (is1155) {
      let orders: Record<string, number> = {}
      let mixedCurrencies = false
      let currencies: string[] = []
      let nativeTotal = 0
      let orderCurrencyTotal = 0
      let totalQuantity = 0
      if (path && path.length > 0) {
        for (let i = 0; i < path.length; i++) {
          const pathItem = path[i]
          const pathQuantity = pathItem.quantity || 0
          const pathPrice = pathItem.totalPrice || 0
          const listingId = pathItem.orderId
          if (!pathItem?.currency || !listingId) {
            continue
          }
          const quantityLeft = quantity - totalQuantity
          if (!currencies.includes(pathItem.currency)) {
            currencies.push(pathItem.currency)
            mixedCurrencies = currencies.length >= 2
          }
          let quantityToTake = 0
          if (quantityLeft >= pathQuantity) {
            quantityToTake = pathQuantity
          } else {
            quantityToTake = quantityLeft
          }

          nativeTotal += (pathItem.buyInQuote || pathPrice) * quantityToTake
          orderCurrencyTotal += pathPrice * quantityToTake
          orders[listingId] = quantityToTake
          totalQuantity += quantityToTake

          if (totalQuantity === quantity) {
            break
          }
        }
        total = mixedCurrencies ? nativeTotal : orderCurrencyTotal
        currency = mixedCurrencies
          ? {
              contract: chainCurrency.address,
              symbol: chainCurrency.symbol,
              decimals: chainCurrency.decimals,
            }
          : {
              contract: path[0].currency as string,
              symbol: path[0].currencySymbol as string,
              decimals: path[0].currencyDecimals as number,
            }
        setCurrency(currency)
        setMixedCurrencies(mixedCurrencies)
      }
    } else if (token?.market?.floorAsk) {
      total = token.market.floorAsk.price?.amount?.decimal || 0
      if (token.market.floorAsk.price?.currency) {
        currency = token.market.floorAsk.price?.currency as Currency
        setCurrency(currency)
      }
      setMixedCurrencies(false)
    }
    let totalFees = 0
    if (total > 0) {
      if (feesOnTopBps && feesOnTopBps.length > 0) {
        const fees = feesOnTopBps.reduce((totalFees, feeOnTop) => {
          const [_, fee] = feeOnTop.split(':')
          return totalFees + (Number(fee) / 10000) * total
        }, 0)
        totalFees += fees
        setFeeOnTop(fees)
      } else if (feesOnTopUsd && feesOnTopUsd.length > 0 && usdPrice) {
        const fees = feesOnTopUsd.reduce((totalFees, feeOnTop) => {
          const [_, fee] = feeOnTop.split(':')
          const atomicUsdPrice = parseUnits(`${usdPrice}`, 6)
          const atomicFee = BigInt(fee)
          const convertedAtomicFee =
            atomicFee * BigInt(10 ** currency?.decimals!)
          const currencyFee = convertedAtomicFee / atomicUsdPrice
          const parsedFee = formatUnits(currencyFee, currency?.decimals || 18)
          return totalFees + Number(parsedFee)
        }, 0)
        totalFees += fees
        setFeeOnTop(fees)
      } else {
        setFeeOnTop(0)
      }
      setTotalPrice(total)
      setTotalIncludingFees(total + totalFees)
      setAverageUnitPrice(total / quantity)
      setBuyStep(BuyStep.Checkout)
    } else {
      setBuyStep(BuyStep.Unavailable)
      setTotalIncludingFees(0)
      setTotalPrice(0)
      setAverageUnitPrice(0)
      setCurrency(undefined)
      setMixedCurrencies(false)
    }
  }, [
    listing,
    path,
    isValidatingListing,
    isFetchingPath,
    is1155,
    orderId,
    feesOnTopBps,
    feesOnTopUsd,
    usdPrice,
    feeOnTop,
    client,
    quantity,
    token,
    chainCurrency.address,
  ])

  useEffect(() => {
    if (balance) {
      const totalPriceTruncated = toFixed(
        totalIncludingFees,
        currency?.decimals || 18
      )
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
  }, [totalIncludingFees, balance, currency])

  useEffect(() => {
    if (!open) {
      setBuyStep(BuyStep.Checkout)
      setTransactionError(null)
      setStepData(null)
      setSteps(null)
      setQuantity(1)
      setPath(undefined)
    }
  }, [open])

  return (
    <>
      {children({
        loading:
          (!listing && isValidatingListing) ||
          !token ||
          isFetchingPath ||
          (is1155 && !path && !orderId),
        token,
        collection,
        listing,
        quantityAvailable: quantityRemaining || 1,
        currency,
        mixedCurrencies,
        totalPrice,
        totalIncludingFees,
        averageUnitPrice,
        feeOnTop,
        buyStep,
        transactionError,
        hasEnoughCurrency,
        addFundsLink,
        feeUsd,
        totalUsd,
        usdPrice,
        balance: balance?.value,
        address: address,
        blockExplorerBaseUrl,
        steps,
        stepData,
        quantity,
        setQuantity,
        setBuyStep,
        buyToken,
      })}
    </>
  )
}
