import React, { FC, useEffect, useState, useCallback, ReactNode } from 'react'
import { useCoinConversion, useReservoirClient, useListings } from '../../hooks'
import { useSigner, useNetwork } from 'wagmi'
import { Execute } from '@reservoir0x/reservoir-sdk'

export enum CancelStep {
  Cancel,
  Approving,
  Complete,
}

export type StepData = {
  totalSteps: number
  stepProgress: number
  currentStep: Execute['steps'][0]
  currentStepItem: NonNullable<Execute['steps'][0]['items']>[0]
}

type ChildrenProps = {
  loading: boolean
  listing?: NonNullable<ReturnType<typeof useListings>['data']>[0]
  tokenId?: string
  contract?: string
  cancelStep: CancelStep
  transactionError?: Error | null
  totalUsd: number
  usdPrice: ReturnType<typeof useCoinConversion>
  blockExplorerBaseUrl: string
  steps: Execute['steps'] | null
  stepData: StepData | null
  setCancelStep: React.Dispatch<React.SetStateAction<CancelStep>>
  cancelOrder: () => void
}

type Props = {
  open: boolean
  listingId?: string
  normalizeRoyalties?: boolean
  children: (props: ChildrenProps) => ReactNode
}

export const CancelListingModalRenderer: FC<Props> = ({
  open,
  listingId,
  normalizeRoyalties,
  children,
}) => {
  const { data: signer } = useSigner()
  const [cancelStep, setCancelStep] = useState<CancelStep>(CancelStep.Cancel)
  const [transactionError, setTransactionError] = useState<Error | null>()
  const [stepData, setStepData] = useState<StepData | null>(null)
  const [steps, setSteps] = useState<Execute['steps'] | null>(null)
  const { chain: activeChain } = useNetwork()
  const blockExplorerBaseUrl =
    activeChain?.blockExplorers?.default.url || 'https://etherscan.io'

  const { data: listings, isFetchingPage } = useListings(
    {
      ids: listingId,
      normalizeRoyalties,
      includeCriteriaMetadata: true,
    },
    {
      revalidateFirstPage: true,
    },
    open && listingId ? true : false
  )

  const listing = listings && listings[0] ? listings[0] : undefined
  const currency = listing?.price?.currency

  const coinConversion = useCoinConversion(
    open && listing ? 'USD' : undefined,
    currency?.symbol
  )
  const usdPrice =
    coinConversion !== undefined && coinConversion !== null
      ? Number(coinConversion)
      : 0
  const totalUsd = usdPrice * (listing?.price?.amount?.decimal || 0)

  const client = useReservoirClient()

  const cancelOrder = useCallback(() => {
    if (!signer) {
      const error = new Error('Missing a signer')
      setTransactionError(error)
      throw error
    }

    if (!listingId) {
      const error = new Error('Missing list id to cancel')
      setTransactionError(error)
      throw error
    }

    if (!client) {
      const error = new Error('ReservoirClient was not initialized')
      setTransactionError(error)
      throw error
    }

    setCancelStep(CancelStep.Approving)

    client.actions
      .cancelOrder({
        id: listingId,
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
            setCancelStep(CancelStep.Complete)
          }
        },
      })
      .catch((e: any) => {
        const error = e as Error
        const message = 'Oops, something went wrong. Please try again.'
        const transactionError = new Error(message, {
          cause: error,
        })
        setTransactionError(transactionError)
        setCancelStep(CancelStep.Cancel)
        setStepData(null)
        setSteps(null)
      })
  }, [listingId, client, signer])

  useEffect(() => {
    if (!open) {
      setCancelStep(CancelStep.Cancel)
      setTransactionError(null)
      setStepData(null)
      setSteps(null)
    }
  }, [open])

  const tokenId = listing?.tokenSetId?.split(':')[2]
  const contract = listing?.tokenSetId?.split(':')[1]

  return (
    <>
      {children({
        loading: isFetchingPage !== undefined ? isFetchingPage : true,
        listing,
        tokenId,
        contract,
        cancelStep,
        transactionError,
        usdPrice,
        totalUsd,
        blockExplorerBaseUrl,
        steps,
        stepData,
        setCancelStep,
        cancelOrder,
      })}
    </>
  )
}
