import React, {
  FC,
  useEffect,
  useState,
  useCallback,
  ReactNode,
  ComponentProps,
} from 'react'
import {
  useTokens,
  useCoinConversion,
  useReservoirClient,
  useCollections,
} from '../../hooks'
import { useAccount, useBalance, useSigner, useNetwork } from 'wagmi'
import { utils } from 'ethers'
import {
  Execute,
  ReservoirClientActions,
} from '@reservoir0x/reservoir-kit-client'
import Fees from './Fees'

export enum AcceptBidStep {
  Checkout,
  ApproveMarketplace,
  Confirming,
  Finalizing,
  Complete,
  Unavailable,
}

export type StepData = {
  totalSteps: number
  currentStep: Execute['steps'][0]
  currentStepItem: NonNullable<Execute['steps'][0]['items']>[0]
}

type ChildrenProps = {
  token?: NonNullable<NonNullable<ReturnType<typeof useTokens>>['data']>[0]
  collection?: NonNullable<ReturnType<typeof useCollections>['data']>[0]
  totalPrice: number
  acceptBidStep: AcceptBidStep
  fees: ComponentProps<typeof Fees>['fees']
  transactionError?: Error | null
  txHash: string | null
  totalUsd: number
  ethUsdPrice: ReturnType<typeof useCoinConversion>
  address?: string
  etherscanBaseUrl: string
  stepData: StepData | null
  acceptBid: () => void
  setAcceptBidStep: React.Dispatch<React.SetStateAction<AcceptBidStep>>
}

type Props = {
  open: boolean
  tokenId?: string
  collectionId?: string
  children: (props: ChildrenProps) => ReactNode
}

export const AcceptBidModalRenderer: FC<Props> = ({
  open,
  tokenId,
  collectionId,
  children,
}) => {
  const { data: signer } = useSigner()
  const [stepData, setStepData] = useState<StepData | null>(null)
  const [totalPrice, setTotalPrice] = useState(0)
  const [acceptBidStep, setAcceptBidStep] = useState<AcceptBidStep>(
    AcceptBidStep.Checkout
  )
  const [transactionError, setTransactionError] = useState<Error | null>()
  const [txHash, setTxHash] = useState<string | null>(null)
  const { chain: activeChain } = useNetwork()
  const etherscanBaseUrl =
    activeChain?.blockExplorers?.etherscan?.url || 'https://etherscan.io'

  const { data: tokens } = useTokens(
    open && {
      tokens: [`${collectionId}:${tokenId}`],
      includeTopBid: true,
    },
    {
      revalidateFirstPage: true,
    }
  )
  const { data: collections } = useCollections(
    open && {
      id: collectionId,
    }
  )
  const collection = collections && collections[0] ? collections[0] : undefined
  const token = tokens && tokens.length > 0 ? tokens[0] : undefined

  const ethUsdPrice = useCoinConversion(open ? 'USD' : undefined)

  const totalUsd = totalPrice * (ethUsdPrice || 0)

  const client = useReservoirClient()

  const feeBreakdown = token?.market?.topBid?.feeBreakdown

  const fees = {
    creatorRoyalties: collection?.royalties?.bps || 0,
    feeBreakdown,
  }

  const acceptBid = useCallback(() => {
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
      setTransactionError(null)
      throw error
    }

    const options: Parameters<
      ReservoirClientActions['acceptOffer']
    >['0']['options'] = {}

    setAcceptBidStep(AcceptBidStep.Confirming)

    client.actions
      .acceptOffer({
        expectedPrice: totalPrice,
        signer,
        token: {
          tokenId: tokenId,
          contract: collectionId,
        },
        onProgress: (steps: Execute['steps']) => {
          if (!steps) return

          const executableSteps = steps.filter(
            (step) => step.items && step.items.length > 0
          )

          let stepCount = executableSteps.length

          let currentStepItem:
            | NonNullable<Execute['steps'][0]['items']>[0]
            | undefined
          let currentStepIndex: number = 0
          steps.find((step, index) => {
            currentStepIndex = index
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
              currentStep,
              currentStepItem,
            })
            if (currentStepIndex !== steps.length - 1) {
              setAcceptBidStep(AcceptBidStep.ApproveMarketplace)
            } else if (currentStepItem.txHash) {
              setTxHash(currentStepItem.txHash)
              setAcceptBidStep(AcceptBidStep.Finalizing)
            } else {
              setAcceptBidStep(AcceptBidStep.Confirming)
            }
          } else if (
            steps.every(
              (step) =>
                !step.items ||
                step.items.length == 0 ||
                step.items?.every((item) => item.status === 'complete')
            )
          ) {
            setAcceptBidStep(AcceptBidStep.Complete)
          }
        },
        options,
      })
      .catch((e: any) => {
        const error = e as Error
        setTransactionError(error)
        setAcceptBidStep(AcceptBidStep.Checkout)
        setStepData(null)
        console.log(error)
      })
  }, [tokenId, collectionId, client, signer, totalPrice])

  useEffect(() => {
    if (token) {
      let topBid = token.market?.topBid?.price?.netAmount?.native
      if (topBid) {
        setTotalPrice(topBid)
        setAcceptBidStep(AcceptBidStep.Checkout)
      } else {
        setAcceptBidStep(AcceptBidStep.Unavailable)
        setTotalPrice(0)
      }
    }
  }, [token, client])

  const { address } = useAccount()
  const { data: balance } = useBalance({
    addressOrName: address,
    watch: open,
  })

  useEffect(() => {
    if (balance) {
      if (!balance.value) {
      } else if (
        balance.value &&
        balance.value.lt(utils.parseEther(`${totalPrice}`))
      ) {
      }
    }
  }, [totalPrice, balance])

  useEffect(() => {
    if (!open) {
      setAcceptBidStep(AcceptBidStep.Checkout)
      setTxHash(null)
      setStepData(null)
      setTransactionError(null)
    }
  }, [open])

  return (
    <>
      {children({
        token,
        collection,
        totalPrice,
        fees,
        acceptBidStep,
        transactionError,
        txHash,
        totalUsd,
        ethUsdPrice,
        address: address,
        etherscanBaseUrl,
        acceptBid,
        setAcceptBidStep,
        stepData,
      })}
    </>
  )
}
