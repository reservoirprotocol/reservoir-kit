import React, { FC, useEffect, useState, useCallback, ReactNode } from 'react'
import {
  useCollection,
  useTokenDetails,
  useCoinConversion,
  useReservoirClient,
  useTokenOpenseaBanned,
  useWethBalance,
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

export enum TokenOfferStep {
  SetPrice,
  Offering,
  Complete,
}

type ChildrenProps = {
  token:
    | false
    | NonNullable<NonNullable<ReturnType<typeof useTokenDetails>>['data']>[0]
  collection: ReturnType<typeof useCollection>['data']
  bidAmount: string
  bidData: BidData | null
  bidAmountUsd: number
  tokenOfferStep: TokenOfferStep
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
  setTokenOfferStep: React.Dispatch<React.SetStateAction<TokenOfferStep>>
  setBidAmount: React.Dispatch<React.SetStateAction<string>>
  setExpirationOption: React.Dispatch<React.SetStateAction<ExpirationOption>>
  placeBid: () => void
}

type Props = {
  open: boolean
  tokenId?: string
  collectionId?: string
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

export const TokenOfferModalRenderer: FC<Props> = ({
  open,
  tokenId,
  collectionId,
  children,
}) => {
  const { data: signer } = useSigner()
  const [tokenOfferStep, setTokenOfferStep] = useState<TokenOfferStep>(
    TokenOfferStep.SetPrice
  )
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

  const { data: tokens } = useTokenDetails(
    open &&
      tokenId !== undefined && {
        tokens: [`${collectionId}:${tokenId}`],
        includeTopBid: true,
      }
  )
  const { data: collection } = useCollection(
    open && {
      id: collectionId,
      includeTopBid: true,
    }
  )
  let token = !!tokens?.length && tokens[0]

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
      setTokenOfferStep(TokenOfferStep.SetPrice)
      setExpirationOption(expirationOptions[0])
      setHasEnoughEth(false)
      setHasEnoughWEth(false)
      setEthAmountToWrap('')
      setBidAmount('')
      setStepData(null)
      setBidData(null)
    }
  }, [open])

  const isBanned = useTokenOpenseaBanned(
    open ? collectionId : undefined,
    tokenId
  )

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

    setTokenOfferStep(TokenOfferStep.Offering)
    setTransactionError(null)
    setBidData(null)

    const bid: BidData = {
      weiPrice: parseEther(`${bidAmount}`).toString(),
      orderbook: 'reservoir',
      orderKind: 'seaport',
    }

    if (tokenId && collectionId) {
      bid.token = `${collectionId}:${tokenId}`
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
        bid.expirationTime = dayjs
          .unix(expirationOption.relativeTime)
          .toString()
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
            setTokenOfferStep(TokenOfferStep.Complete)
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
  }, [tokenId, collectionId, client, signer, bidAmount])

  return (
    <>
      {children({
        token,
        collection,
        ethUsdPrice,
        isBanned,
        balance: balance?.value,
        wethBalance: wethBalance?.value,
        wethUniswapLink,
        bidAmount,
        bidData,
        bidAmountUsd,
        tokenOfferStep,
        hasEnoughEth,
        hasEnoughWEth,
        ethAmountToWrap,
        transactionError,
        expirationOption,
        expirationOptions,
        stepData,
        setTokenOfferStep,
        setBidAmount,
        setExpirationOption,
        placeBid,
      })}
    </>
  )
}
