import React, { FC, useEffect, useState, useCallback, ReactNode } from 'react'
import {
  useTokens,
  useCoinConversion,
  useReservoirClient,
  useTokenOpenseaBanned,
  useCollections,
  useListings,
} from '../../hooks'
import { useAccount, useBalance, useSigner, useNetwork } from 'wagmi'

import { BigNumber, utils } from 'ethers'
import { Execute, ReservoirClientActions } from '@reservoir0x/reservoir-sdk'
import { UseBalanceToken } from '../../types/wagmi'
import { toFixed } from '../../lib/numbers'
import { formatUnits } from 'ethers/lib/utils.js'
import { constants } from 'ethers'

export enum BuyStep {
  Checkout,
  Approving,
  AddFunds,
  Complete,
  Unavailable,
}

export type StepData = {
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
  currency?: NonNullable<
    NonNullable<
      NonNullable<
        NonNullable<NonNullable<Token>['market']>['floorAsk']
      >['price']
    >['currency']
  >
  totalPrice: number
  referrerFee: number
  buyStep: BuyStep
  transactionError?: Error | null
  hasEnoughCurrency: boolean
  feeUsd: number
  totalUsd: number
  usdPrice: ReturnType<typeof useCoinConversion>
  isBanned: boolean
  balance?: BigNumber
  address?: string
  blockExplorerBaseUrl: string
  steps: Execute['steps'] | null
  stepData: StepData | null
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
  referrerFeeBps?: number | null
  referrer?: string | null
  normalizeRoyalties?: boolean
  children: (props: ChildrenProps) => ReactNode
}

export const BuyModalRenderer: FC<Props> = ({
  open,
  tokenId,
  collectionId,
  orderId,
  referrer,
  referrerFeeBps,
  normalizeRoyalties,
  children,
}) => {
  const { data: signer } = useSigner()
  const [totalPrice, setTotalPrice] = useState(0)
  const [referrerFee, setReferrerFee] = useState(0)
  const [buyStep, setBuyStep] = useState<BuyStep>(BuyStep.Checkout)
  const [transactionError, setTransactionError] = useState<Error | null>()
  const [hasEnoughCurrency, setHasEnoughCurrency] = useState(true)
  const [stepData, setStepData] = useState<StepData | null>(null)
  const [steps, setSteps] = useState<Execute['steps'] | null>(null)
  const [quantity, setQuantity] = useState(1)
  const { chain: activeChain } = useNetwork()
  const blockExplorerBaseUrl =
    activeChain?.blockExplorers?.default?.url || 'https://etherscan.io'

  const contract = collectionId ? collectionId?.split(':')[0] : undefined

  const { data: tokens, mutate: mutateTokens } = useTokens(
    open && {
      tokens: [`${contract}:${tokenId}`],
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

  const collection = collections && collections[0] ? collections[0] : undefined
  const token = tokens && tokens.length > 0 ? tokens[0] : undefined

  const {
    data: listings,
    mutate: mutateListings,
    isValidating: isValidatingListing,
  } = useListings(
    {
      token: `${contract}:${tokenId}`,
      ids: orderId ? orderId : token?.market?.floorAsk?.id,
      normalizeRoyalties,
      status: 'active',
    },
    {
      revalidateFirstPage: true,
    },
    open && (token?.market?.floorAsk?.id !== undefined || orderId)
      ? true
      : false
  )

  const listing =
    listings && listings[0] && listings[0].status === 'active'
      ? listings[0]
      : undefined
  const currency = listing?.price?.currency

  const usdPrice = useCoinConversion(
    open && token ? 'USD' : undefined,
    currency?.symbol
  )
  const feeUsd = referrerFee * (usdPrice || 0)
  const totalUsd = totalPrice * (usdPrice || 0)

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

    if (referrer && referrerFeeBps) {
      const price = toFixed(totalPrice, currency?.decimals || 18)
      const fee = utils
        .parseUnits(`${price}`, currency?.decimals)
        .mul(referrerFeeBps)
        .div(10000)
      const atomicUnitsFee = formatUnits(fee, 0)
      options.feesOnTop = [`${referrer}:${atomicUnitsFee}`]
    } else if (referrer === null && referrerFeeBps === null) {
      delete options.feesOnTop
    }

    if (quantity > 1) {
      options.quantity = quantity
    }

    if (normalizeRoyalties !== undefined) {
      options.normalizeRoyalties = normalizeRoyalties
    }

    setBuyStep(BuyStep.Approving)

    let orderIds = orderId ? [orderId] : undefined

    let tokens = orderId
      ? undefined
      : [
          {
            tokenId: tokenId,
            contract: contract,
          },
        ]

    client.actions
      .buyToken({
        orderIds: orderIds,
        expectedPrice: totalPrice,
        signer,
        tokens: tokens,
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
          let message = 'Oops, something went wrong. Please try again.'
          if (errorType && errorType === 'price mismatch') {
            message = error.message
          }
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
    referrer,
    referrerFeeBps,
    quantity,
    normalizeRoyalties,
    client,
    signer,
    currency,
    totalPrice,
    mutateListings,
    mutateTokens,
    mutateCollection,
  ])

  useEffect(() => {
    if (listing) {
      if (listing.price?.amount?.decimal) {
        let floorPrice = listing.price?.amount?.decimal

        if (referrerFeeBps && referrer) {
          const fee = (referrerFeeBps / 10000) * floorPrice

          floorPrice = floorPrice + fee
          setReferrerFee(fee)
        }
        setTotalPrice(floorPrice * quantity)
        setBuyStep(BuyStep.Checkout)
      } else {
        setBuyStep(BuyStep.Unavailable)
        setTotalPrice(0)
      }
    } else if (!listing && !isValidatingListing && token) {
      setBuyStep(BuyStep.Unavailable)
      setTotalPrice(0)
    }
  }, [
    listing,
    isValidatingListing,
    referrerFeeBps,
    referrer,
    client,
    quantity,
    token,
  ])

  const { address } = useAccount()
  const { data: balance } = useBalance({
    address: address,
    token:
      currency?.contract !== constants.AddressZero
        ? (currency?.contract as UseBalanceToken)
        : undefined,
    watch: open,
    formatUnits: currency?.decimals,
  })

  useEffect(() => {
    if (balance) {
      const totalPriceTruncated = toFixed(totalPrice, currency?.decimals || 18)
      if (!balance.value) {
        setHasEnoughCurrency(false)
      } else if (
        balance.value.lt(
          utils.parseUnits(`${totalPriceTruncated}`, currency?.decimals)
        )
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
        quantityAvailable: listing?.quantityRemaining || 1,
        currency,
        totalPrice,
        referrerFee,
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
        setQuantity,
        setBuyStep,
        buyToken,
      })}
    </>
  )
}
