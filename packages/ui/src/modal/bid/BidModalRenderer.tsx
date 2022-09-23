import React, { FC, useEffect, useState, useCallback, ReactNode } from 'react'
import {
  useTokens,
  useCoinConversion,
  useReservoirClient,
  useTokenOpenseaBanned,
  useWethBalance,
  useCollections,
  useAttributes,
} from '../../hooks'
import { useAccount, useBalance, useNetwork, useSigner } from 'wagmi'

import { BigNumber, constants } from 'ethers'
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

export type Trait =
  | {
      key: string
      value: string
    }
  | undefined

type ChildrenProps = {
  token?: NonNullable<NonNullable<ReturnType<typeof useTokens>>['data']>[0]
  collection?: NonNullable<ReturnType<typeof useCollections>['data']>[0]
  attributes?: NonNullable<ReturnType<typeof useAttributes>['data']>
  bidAmount: string
  bidData: BidData | null
  bidAmountUsd: number
  bidStep: BidStep
  hasEnoughEth: boolean
  hasEnoughWEth: boolean
  ethAmountToWrap: string
  ethUsdPrice: ReturnType<typeof useCoinConversion>
  isBanned: boolean
  balance?: BigNumber
  wethBalance?: BigNumber
  wethUniswapLink: string
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
  children,
}) => {
  const { data: signer } = useSigner()
  const [bidStep, setBidStep] = useState<BidStep>(BidStep.SetPrice)
  const [transactionError, setTransactionError] = useState<Error | null>()
  const [bidAmount, setBidAmount] = useState<string>('')
  const [expirationOption, setExpirationOption] = useState<ExpirationOption>(
    expirationOptions[0]
  )
  const [hasEnoughEth, setHasEnoughEth] = useState(false)
  const [hasEnoughWEth, setHasEnoughWEth] = useState(false)
  const [ethAmountToWrap, setEthAmountToWrap] = useState('')
  const [stepData, setStepData] = useState<StepData | null>(null)
  const [bidData, setBidData] = useState<BidData | null>(null)
  const contract = collectionId ? collectionId?.split(':')[0] : undefined
  const [trait, setTrait] = useState<Trait>(attribute)

  const { data: tokens } = useTokens(
    open &&
      tokenId !== undefined && {
        tokens: [`${contract}:${tokenId}`],
        includeTopBid: true,
      },
    {
      revalidateFirstPage: true,
    }
  )

  const traits = useAttributes(collectionId)

  const { data: collections } = useCollections(
    open && {
      id: collectionId,
      includeTopBid: true,
    }
  )

  const attributes = traits.data ? traits.data : undefined

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
    balance: { data: wethBalance },
    contractAddress,
  } = useWethBalance({
    addressOrName: address,
    watch: open,
  })

  const { chain } = useNetwork()
  const wethUniswapLink = `https://app.uniswap.org/#/swap?theme=dark&exactAmount=${ethAmountToWrap}&chain=${
    chain?.network || 'mainnet'
  }&inputCurrency=eth&outputCurrency=${contractAddress}`

  useEffect(() => {
    if (bidAmount !== '') {
      const bid = parseEther(bidAmount)

      if (!wethBalance?.value || wethBalance?.value.lt(bid)) {
        setHasEnoughWEth(false)
        const wethAmount = wethBalance?.value || constants.Zero
        const amountToWrap = bid.sub(wethAmount)
        setEthAmountToWrap(formatBN(bid.sub(wethAmount), 5))

        if (!balance?.value || balance.value.lt(amountToWrap)) {
          setHasEnoughEth(false)
        } else {
          setHasEnoughEth(true)
        }
      } else {
        setHasEnoughWEth(true)
        setHasEnoughEth(true)
        setEthAmountToWrap('')
      }
    } else {
      setHasEnoughEth(true)
      setHasEnoughWEth(true)
      setEthAmountToWrap('')
    }
  }, [bidAmount, balance, wethBalance])

  useEffect(() => {
    if (!open) {
      setBidStep(BidStep.SetPrice)
      setExpirationOption(expirationOptions[0])
      setHasEnoughEth(false)
      setHasEnoughWEth(false)
      setEthAmountToWrap('')
      setBidAmount('')
      setStepData(null)
      setBidData(null)
      setTransactionError(null)
      setTrait(undefined)
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
        balance: balance?.value,
        wethBalance: wethBalance?.value,
        wethUniswapLink,
        bidAmount,
        bidData,
        bidAmountUsd,
        bidStep,
        hasEnoughEth,
        hasEnoughWEth,
        ethAmountToWrap,
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
