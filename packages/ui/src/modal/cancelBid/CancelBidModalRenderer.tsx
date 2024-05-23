import React, { FC, useEffect, useState, useCallback, ReactNode } from 'react'
import { useCoinConversion, useReservoirClient, useUserBids } from '../../hooks'
import { useAccount, useConfig, useWalletClient } from 'wagmi'
import { Execute, ReservoirWallet, axios } from '@reservoir0x/reservoir-sdk'
import { getAccount, switchChain } from 'wagmi/actions'
import { customChains } from '@reservoir0x/reservoir-sdk'
import * as allChains from 'viem/chains'
import { WalletClient } from 'viem'

export enum CancelStep {
  Cancel,
  Approving,
  Complete,
}

export type CancelBidStepData = {
  totalSteps: number
  stepProgress: number
  currentStep: Execute['steps'][0]
  currentStepItem: NonNullable<Execute['steps'][0]['items']>[0]
}

type ChildrenProps = {
  loading: boolean
  bid?: NonNullable<ReturnType<typeof useUserBids>['data']>[0]
  tokenId?: string
  cancelStep: CancelStep
  transactionError?: Error | null
  totalUsd: number
  usdPrice: number
  blockExplorerBaseUrl: string
  blockExplorerName: string
  steps: Execute['steps'] | null
  stepData: CancelBidStepData | null
  setCancelStep: React.Dispatch<React.SetStateAction<CancelStep>>
  cancelOrder: () => void
}

type Props = {
  open: boolean
  bidId?: string
  chainId?: number
  normalizeRoyalties?: boolean
  children: (props: ChildrenProps) => ReactNode
  walletClient?: ReservoirWallet | WalletClient
}

export const CancelBidModalRenderer: FC<Props> = ({
  open,
  chainId,
  bidId,
  normalizeRoyalties,
  children,
  walletClient,
}) => {
  const [cancelStep, setCancelStep] = useState<CancelStep>(CancelStep.Cancel)
  const [transactionError, setTransactionError] = useState<Error | null>()
  const [stepData, setStepData] = useState<CancelBidStepData | null>(null)
  const [steps, setSteps] = useState<Execute['steps'] | null>(null)

  const client = useReservoirClient()
  const currentChain = client?.currentChain()
  const config = useConfig()
  const { address } = useAccount()

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

  const { data: bids, isFetchingPage } = useUserBids(
    address,
    {
      ids: bidId,
      normalizeRoyalties,
      includeCriteriaMetadata: true,
      includeRawData: true,
    },
    {
      revalidateFirstPage: true,
    },
    open && bidId ? true : false,
    rendererChain?.id
  )

  const bid = bids && bids[0] ? bids[0] : undefined
  const currency = bid?.price?.currency

  const coinConversion = useCoinConversion(
    open && bid ? 'USD' : undefined,
    currency?.symbol
  )
  const usdPrice = coinConversion.length > 0 ? coinConversion[0].price : 0
  const totalUsd = usdPrice * (bid?.price?.amount?.decimal || 0)

  const cancelOrder = useCallback(async () => {
    if (!wallet) {
      const error = new Error('Missing a wallet/signer')
      setTransactionError(error)
      throw error
    }

    let activeWalletChain = getAccount(config).chain
    if (rendererChain?.id !== activeWalletChain?.id) {
      activeWalletChain = await switchChain(config, {
        chainId: rendererChain?.id as number,
      })
    }

    if (rendererChain?.id !== activeWalletChain?.id) {
      const error = new Error(`Mismatching chainIds`)
      setTransactionError(error)
      throw error
    }

    if (!bidId) {
      const error = new Error('Missing bid id to cancel')
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
        chainId: rendererChain?.id,
        ids: [bidId],
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
  }, [bidId, client, rendererChain, wallet, config])

  useEffect(() => {
    if (!open) {
      setCancelStep(CancelStep.Cancel)
      setTransactionError(null)
      setStepData(null)
      setSteps(null)
    }
  }, [open])

  open
    ? (axios.defaults.headers.common['x-rkui-context'] =
        'cancelBidModalRenderer')
    : delete axios.defaults.headers.common?.['x-rkui-context']

  let tokenId

  if (bid?.criteria?.kind === 'token') {
    tokenId = bid?.tokenSetId?.split(':')[2]
  }

  return (
    <>
      {children({
        loading: isFetchingPage !== undefined ? isFetchingPage : true,
        bid,
        tokenId,
        cancelStep,
        transactionError,
        usdPrice,
        totalUsd,
        blockExplorerName,
        blockExplorerBaseUrl,
        steps,
        stepData,
        setCancelStep,
        cancelOrder,
      })}
    </>
  )
}
