import React, { FC, useEffect, useState, useCallback, ReactNode } from 'react'
import {
  useTokens,
  useCoinConversion,
  useReservoirClient,
  useTokenOpenseaBanned,
  useWrappedBalance,
  useCollections,
  useAttributes,
} from '../../hooks'
import { chainId, useAccount, useBalance, useNetwork, useSigner } from 'wagmi'

import { constants } from 'ethers'
import {
  Execute,
  ReservoirClientActions,
} from '@reservoir0x/reservoir-kit-client'
import { ExpirationOption } from '../../types/ExpirationOption'
import defaultExpirationOptions from '../../lib/defaultExpirationOptions'
import { formatBN } from '../../lib/numbers'
import { parseEther } from 'ethers/lib/utils'
import dayjs from 'dayjs'

const expirationOptions = [
  ...defaultExpirationOptions,
  {
    text: 'Custom',
    value: 'custom',
    relativeTime: null,
    relativeTimeUnit: null,
  },
]

export enum BidStep {
  SetPrice,
  Offering,
  Complete,
}

export type Traits =
  | NonNullable<ReturnType<typeof useAttributes>['data']>
  | undefined

export type Trait =
  | {
      key: string
      value: string
    }
  | undefined

type ChildrenProps = {
  token?: NonNullable<NonNullable<ReturnType<typeof useTokens>>['data']>[0]
  collection?: NonNullable<ReturnType<typeof useCollections>['data']>[0]
  attributes?: Traits
  bidAmount: string
  bidData: BidData | null
  bidAmountUsd: number
  bidStep: BidStep
  hasEnoughNativeCurrency: boolean
  hasEnoughWEth: boolean
  amountToWrap: string
  ethUsdPrice: ReturnType<typeof useCoinConversion>
  isBanned: boolean
  balance?: ReturnType<typeof useBalance>['data']
  wrappedBalance?: ReturnType<typeof useBalance>['data']
  uniswapConvertLink: string
  transactionError?: Error | null
  expirationOptions: ExpirationOption[]
  expirationOption: ExpirationOption
  stepData: StepData | null
  setBidStep: React.Dispatch<React.SetStateAction<BidStep>>
  setBidAmount: React.Dispatch<React.SetStateAction<string>>
  setExpirationOption: React.Dispatch<React.SetStateAction<ExpirationOption>>
  setTrait: React.Dispatch<React.SetStateAction<Trait>>
  trait: Trait
  placeBid: () => void
}

type Props = {
  open: boolean
  tokenId?: string
  collectionId?: string
  attribute?: Trait
  normalizeRoyalties?: boolean
  children: (props: ChildrenProps) => ReactNode
}

export type BidData = Parameters<
  ReservoirClientActions['placeBid']
>['0']['bids'][0]

export type StepData = {
  totalSteps: number
  stepProgress: number
  currentStep: Execute['steps'][0]
}

export const BidModalRenderer: FC<Props> = ({
  open,
  tokenId,
  collectionId,
  attribute,
  normalizeRoyalties,
  children,
}) => {
  const { data: signer } = useSigner()
  const [bidStep, setBidStep] = useState<BidStep>(BidStep.SetPrice)
  const [transactionError, setTransactionError] = useState<Error | null>()
  const [bidAmount, setBidAmount] = useState<string>('')
  const [expirationOption, setExpirationOption] = useState<ExpirationOption>(
    expirationOptions[3]
  )
  const [hasEnoughNativeCurrency, setHasEnoughNativeCurrency] = useState(false)
  const [hasEnoughWEth, setHasEnoughWEth] = useState(false)
  const [amountToWrap, setAmountToWrap] = useState('')
  const [stepData, setStepData] = useState<StepData | null>(null)
  const [bidData, setBidData] = useState<BidData | null>(null)
  const contract = collectionId ? collectionId?.split(':')[0] : undefined
  const [trait, setTrait] = useState<Trait>(attribute)
  const [attributes, setAttributes] = useState<Traits>()

  const { data: tokens } = useTokens(
    open &&
      tokenId !== undefined && {
        tokens: [`${contract}:${tokenId}`],
        includeTopBid: true,
        normalizeRoyalties,
      },
    {
      revalidateFirstPage: true,
    }
  )

  const { data: traits } = useAttributes(
    open && !tokenId ? collectionId : undefined
  )

  const { data: collections } = useCollections(
    open && {
      id: collectionId,
      includeTopBid: true,
      normalizeRoyalties,
    }
  )

  const collection = collections && collections[0] ? collections[0] : undefined

  const token = tokens && tokens.length > 0 ? tokens[0] : undefined

  const ethUsdPrice = useCoinConversion(open ? 'USD' : undefined)
  const bidAmountUsd = +bidAmount * (ethUsdPrice || 0)

  const client = useReservoirClient()

  const { address } = useAccount()
  const { data: balance } = useBalance({
    addressOrName: address,
    watch: open,
  })

  const {
    balance: { data: wrappedBalance },
    contractAddress,
  } = useWrappedBalance({
    addressOrName: address,
    watch: open,
  })

  const { chain } = useNetwork()
  const uniswapConvertLink =
    chain?.id === chainId.mainnet || chain?.id === chainId.goerli
      ? `https://app.uniswap.org/#/swap?theme=dark&exactAmount=${amountToWrap}&chain=${
          chain?.network || 'mainnet'
        }&inputCurrency=eth&outputCurrency=${contractAddress}`
      : `https://app.uniswap.org/#/swap?theme=dark&exactAmount=${amountToWrap}`

  useEffect(() => {
    if (bidAmount !== '') {
      const bid = parseEther(bidAmount)

      if (!wrappedBalance?.value || wrappedBalance?.value.lt(bid)) {
        setHasEnoughWEth(false)
        const wethAmount = wrappedBalance?.value || constants.Zero
        const amountToWrap = bid.sub(wethAmount)
        setAmountToWrap(formatBN(bid.sub(wethAmount), 5))

        if (!balance?.value || balance.value.lt(amountToWrap)) {
          setHasEnoughNativeCurrency(false)
        } else {
          setHasEnoughNativeCurrency(true)
        }
      } else {
        setHasEnoughWEth(true)
        setHasEnoughNativeCurrency(true)
        setAmountToWrap('')
      }
    } else {
      setHasEnoughNativeCurrency(true)
      setHasEnoughWEth(true)
      setAmountToWrap('')
    }
  }, [bidAmount, balance, wrappedBalance])

  useEffect(() => {
    const validAttributes = traits
      ? traits.filter(
          (attribute) => attribute.values && attribute.values.length > 0
        )
      : undefined
    setAttributes(validAttributes)
  }, [traits])

  useEffect(() => {
    const validAttributes = traits
      ? traits.filter(
          (attribute) => attribute.values && attribute.values.length > 0
        )
      : undefined
    setAttributes(validAttributes)
  }, [traits])

  useEffect(() => {
    if (!open) {
      setBidStep(BidStep.SetPrice)
      setExpirationOption(expirationOptions[3])
      setHasEnoughNativeCurrency(false)
      setHasEnoughWEth(false)
      setAmountToWrap('')
      setBidAmount('')
      setStepData(null)
      setBidData(null)
      setTransactionError(null)
      setTrait(undefined)
    } else {
      setTrait(attribute)
    }
  }, [open])

  const isBanned = useTokenOpenseaBanned(open ? contract : undefined, tokenId)

  const placeBid = useCallback(() => {
    if (!signer) {
      const error = new Error('Missing a signer')
      setTransactionError(error)
      throw error
    }

    if (!tokenId && !collectionId) {
      const error = new Error('Missing tokenId and collectionId')
      setTransactionError(error)
      throw error
    }

    if (!client) {
      const error = new Error('ReservoirClient was not initialized')
      setTransactionError(error)
      throw error
    }

    setBidStep(BidStep.Offering)
    setTransactionError(null)
    setBidData(null)

    const bid: BidData = {
      weiPrice: parseEther(`${bidAmount}`).toString(),
      orderbook: 'reservoir',
      orderKind: 'seaport',
      attributeKey: trait?.key,
      attributeValue: trait?.value,
    }

    if (tokenId && collectionId) {
      const contract = collectionId ? collectionId?.split(':')[0] : undefined
      bid.token = `${contract}:${tokenId}`
    } else if (collectionId) {
      bid.collection = collectionId
    }

    if (expirationOption.relativeTime) {
      if (expirationOption.relativeTimeUnit) {
        bid.expirationTime = dayjs()
          .add(expirationOption.relativeTime, expirationOption.relativeTimeUnit)
          .unix()
          .toString()
      } else {
        bid.expirationTime = `${expirationOption.relativeTime}`
      }
    }

    setBidData(bid)

    client.actions
      .placeBid({
        signer,
        bids: [bid],
        onProgress: (steps: Execute['steps']) => {
          const executableSteps = steps.filter(
            (step) => step.items && step.items.length > 0
          )

          let stepCount = executableSteps.length
          let incompleteStepItemIndex: number | null = null
          let incompleteStepIndex: number | null = null

          executableSteps.find((step, i) => {
            if (!step.items) {
              return false
            }

            incompleteStepItemIndex = step.items.findIndex(
              (item) => item.status == 'incomplete'
            )
            if (incompleteStepItemIndex !== -1) {
              incompleteStepIndex = i
              return true
            }
          })

          if (incompleteStepIndex !== null) {
            setStepData({
              totalSteps: stepCount,
              stepProgress: incompleteStepIndex,
              currentStep: executableSteps[incompleteStepIndex],
            })
          } else {
            setBidStep(BidStep.Complete)
          }
        },
      })
      .catch((e: any) => {
        const transactionError = new Error(e?.message || '', {
          cause: e,
        })
        setTransactionError(transactionError)
        console.log(e)
      })
  }, [
    tokenId,
    collectionId,
    client,
    signer,
    bidAmount,
    expirationOption,
    trait,
  ])

  return (
    <>
      {children({
        token,
        collection,
        attributes,
        ethUsdPrice,
        isBanned,
        balance,
        wrappedBalance,
        uniswapConvertLink,
        bidAmount,
        bidData,
        bidAmountUsd,
        bidStep,
        hasEnoughNativeCurrency,
        hasEnoughWEth,
        amountToWrap,
        transactionError,
        expirationOption,
        expirationOptions,
        stepData,
        setBidStep,
        setBidAmount,
        setExpirationOption,
        setTrait,
        trait,
        placeBid,
      })}
    </>
  )
}
