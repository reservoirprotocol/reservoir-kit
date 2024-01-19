import React, { FC, useEffect, useState, useCallback, ReactNode } from 'react'
import { useCoinConversion, useReservoirClient, useListings } from '../../hooks'
import { useWalletClient } from 'wagmi'
import { Execute, ReservoirWallet, axios } from '@reservoir0x/reservoir-sdk'
import { getNetwork, switchNetwork } from 'wagmi/actions'
import { customChains } from '@reservoir0x/reservoir-sdk'
import * as allChains from 'viem/chains'
import { WalletClient } from 'viem'

export enum CancelStep {
  Cancel,
  Approving,
  Complete,
}

export type CancelListingStepData = {
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
  usdPrice: number
  blockExplorerBaseUrl: string
  blockExplorerName: string
  steps: Execute['steps'] | null
  stepData: CancelListingStepData | null
  setCancelStep: React.Dispatch<React.SetStateAction<CancelStep>>
  cancelOrder: () => void
}

type Props = {
  open: boolean
  listingId?: string
  chainId?: number
  normalizeRoyalties?: boolean
  children: (props: ChildrenProps) => ReactNode
  walletClient?: ReservoirWallet | WalletClient
}

export const CancelListingModalRenderer: FC<Props> = ({
  open,
  listingId,
  chainId,
  normalizeRoyalties,
  children,
  walletClient,
}) => {
  const [cancelStep, setCancelStep] = useState<CancelStep>(CancelStep.Cancel)
  const [transactionError, setTransactionError] = useState<Error | null>()
  const [stepData, setStepData] = useState<CancelListingStepData | null>(null)
  const [steps, setSteps] = useState<Execute['steps'] | null>(null)

  const client = useReservoirClient()
  const currentChain = client?.currentChain()

  const rendererChain = chainId
    ? client?.chains.find(({ id }) => id === chainId) || currentChain
    : currentChain

  const wagmiChain: allChains.Chain | undefined = Object.values({
    ...allChains,
    ...customChains,
  }).find(({ id }) => rendererChain?.id === id)

  const { data: wagmiWallet } = useWalletClient({ chainId: rendererChain?.id })

  const wallet = walletClient || wagmiWallet
  const blockExplorerBaseUrl =
    wagmiChain?.blockExplorers?.default.url || 'https://etherscan.io'

  const blockExplorerName =
    wagmiChain?.blockExplorers?.default?.name || 'Etherscan'

  const { data: listings, isFetchingPage } = useListings(
    {
      ids: listingId,
      normalizeRoyalties,
      includeCriteriaMetadata: true,
      includeRawData: true,
    },
    {
      revalidateFirstPage: true,
    },
    open && listingId ? true : false,
    rendererChain?.id
  )

  const listing = listings && listings[0] ? listings[0] : undefined
  const currency = listing?.price?.currency

  const coinConversion = useCoinConversion(
    open && listing ? 'USD' : undefined,
    currency?.symbol
  )
  const usdPrice = coinConversion.length > 0 ? coinConversion[0].price : 0
  const totalUsd = usdPrice * (listing?.price?.amount?.decimal || 0)

  const cancelOrder = useCallback(async () => {
    if (!wallet) {
      const error = new Error('Missing a wallet/signer')
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

    let activeWalletChain = getNetwork().chain
    if (activeWalletChain && rendererChain?.id !== activeWalletChain?.id) {
      activeWalletChain = await switchNetwork({
        chainId: rendererChain?.id as number,
      })
    }

    if (rendererChain?.id !== activeWalletChain?.id) {
      const error = new Error(`Mismatching chainIds`)
      setTransactionError(error)
      throw error
    }

    setCancelStep(CancelStep.Approving)

    client.actions
      .cancelOrder({
        chainId: rendererChain?.id,
        ids: [listingId],
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
            setCancelStep(CancelStep.Complete)
          }
        },
      })
      .catch((error: Error) => {
        setTransactionError(error)
        setCancelStep(CancelStep.Cancel)
        setStepData(null)
        setSteps(null)
      })
  }, [listingId, client, rendererChain, wallet])

  axios.defaults.headers.common['x-rkui-context'] = open
    ? 'cancelListingModalRenderer'
    : ''

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
        blockExplorerName,
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
