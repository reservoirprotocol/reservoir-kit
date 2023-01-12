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
  useBids,
} from '../../hooks'
import { useAccount, useSigner, useNetwork } from 'wagmi'
import { Execute } from '@reservoir0x/reservoir-sdk'
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
  currentStepItem?: NonNullable<Execute['steps'][0]['items']>[0]
}

type OrderSource = NonNullable<
  NonNullable<
    NonNullable<
      NonNullable<NonNullable<ReturnType<typeof useTokens>>['data']>[0]
    >['market']
  >['topBid']
>['source']

type ChildrenProps = {
  loading: boolean
  token?: NonNullable<NonNullable<ReturnType<typeof useTokens>>['data']>[0]
  collection?: NonNullable<ReturnType<typeof useCollections>['data']>[0]
  source?: OrderSource
  expiration?: number
  totalPrice: number
  bidAmount: number
  bidAmountCurrency?: {
    contract?: string
    decimals?: number
  }
  ethBidAmount?: number
  acceptBidStep: AcceptBidStep
  fees: ComponentProps<typeof Fees>['fees']
  transactionError?: Error | null
  txHash: string | null
  totalUsd: number
  usdPrice: ReturnType<typeof useCoinConversion>
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
  bidId?: string
  normalizeRoyalties?: boolean
  children: (props: ChildrenProps) => ReactNode
}

export const AcceptBidModalRenderer: FC<Props> = ({
  open,
  tokenId,
  bidId,
  collectionId,
  normalizeRoyalties,
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
  const contract = collectionId ? collectionId?.split(':')[0] : undefined

  const { data: tokens, mutate: mutateTokens } = useTokens(
    open && {
      tokens: [`${contract}:${tokenId}`],
      includeTopBid: true,
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

  const {
    data: bids,
    isValidating: isFetchingBidData,
    mutate: mutateBids,
  } = useBids(
    {
      ids: bidId,
      status: 'active',
      includeCriteriaMetadata: true,
      normalizeRoyalties,
    },
    {
      revalidateFirstPage: true,
    },
    open && bidId ? true : false
  )

  const bid = bids && bids[0] ? bids[0] : undefined
  const collection = collections && collections[0] ? collections[0] : undefined
  const token = tokens && tokens.length > 0 ? tokens[0] : undefined

  const client = useReservoirClient()

  let feeBreakdown
  let source
  let expiration
  let bidAmount = 0
  let bidAmountCurrency
  let ethBidAmount

  if (acceptBidStep !== AcceptBidStep.Unavailable) {
    source = bidId ? bid?.source : token?.market?.topBid?.source
    expiration = bidId ? bid?.expiration : token?.market?.topBid?.validUntil
    bidAmount = bidId
      ? bid?.price?.amount?.decimal || 0
      : token?.market?.topBid?.price?.amount?.decimal || 0
    bidAmountCurrency = bidId
      ? bid?.price?.currency
      : token?.market?.topBid?.price?.currency
    ethBidAmount = bidId
      ? bid?.price?.amount?.native
      : token?.market?.floorAsk?.price?.amount?.native
    feeBreakdown = bidId
      ? bid?.feeBreakdown
      : token?.market?.topBid?.feeBreakdown
  }

  const usdPrice = useCoinConversion(
    open && bidAmountCurrency ? 'USD' : undefined,
    bidAmountCurrency?.symbol
  )

  const totalUsd = totalPrice * (usdPrice || 0)

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

    const contract = collectionId.split(':')[0]

    type AcceptOfferOptions = Parameters<
      typeof client.actions.acceptOffer
    >['0']['options']
    let options: NonNullable<AcceptOfferOptions> = {}

    if (bidId) {
      options = {
        ...options,
        orderId: bidId,
      }
    }

    setAcceptBidStep(AcceptBidStep.Confirming)

    client.actions
      .acceptOffer({
        expectedPrice: totalPrice,
        signer,
        token: {
          tokenId: tokenId,
          contract,
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
          executableSteps.find((step, index) => {
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
            if (currentStepIndex !== executableSteps.length - 1) {
              setAcceptBidStep(AcceptBidStep.ApproveMarketplace)
            } else if (currentStepItem.txHash) {
              setTxHash(currentStepItem.txHash)
              setAcceptBidStep(AcceptBidStep.Finalizing)
            } else {
              setAcceptBidStep(AcceptBidStep.Confirming)
            }
          } else if (
            executableSteps.every(
              (step) =>
                !step.items ||
                step.items.length == 0 ||
                step.items?.every((item) => item.status === 'complete')
            )
          ) {
            setAcceptBidStep(AcceptBidStep.Complete)
            const lastStepItem = currentStep.items
              ? currentStep.items[currentStep.items?.length - 1]
              : undefined
            if (lastStepItem) {
              setStepData({
                totalSteps: stepCount,
                currentStep,
                currentStepItem: lastStepItem,
              })
            }
          }
        },
        options,
      })
      .catch((e: any) => {
        const error = e as Error
        const errorType = (error as any)?.type
        let message = 'Oops, something went wrong. Please try again.'
        if (errorType && errorType === 'price mismatch') {
          message = error.message
        }
        const transactionError = new Error(message, {
          cause: error,
        })
        setTransactionError(transactionError)
        setAcceptBidStep(AcceptBidStep.Checkout)
        setStepData(null)
        if (bidId) {
          mutateBids()
        }
        mutateCollection()
        mutateTokens()
      })
  }, [
    tokenId,
    collectionId,
    client,
    signer,
    totalPrice,
    mutateTokens,
    mutateCollection,
    mutateBids,
  ])

  useEffect(() => {
    if (bidId) {
      let price = 0
      if (
        bid &&
        bid.status === 'active' &&
        bid.price?.netAmount?.native &&
        bid.criteria?.data?.collection?.id === collectionId
      ) {
        if (bid.criteria?.kind === 'token') {
          const tokenSetPieces = bid.tokenSetId.split(':')
          const bidTokenId = tokenSetPieces[tokenSetPieces.length - 1]
          if (tokenId === bidTokenId) {
            price = bid.price?.netAmount?.native
          }
        } else {
          price = bid.price?.netAmount?.native
        }
      }
      if (!isFetchingBidData) {
        setTotalPrice(price)
        setAcceptBidStep(
          price > 0 ? AcceptBidStep.Checkout : AcceptBidStep.Unavailable
        )
      }
    } else if (token) {
      let topBid = token.market?.topBid?.price?.netAmount?.native
      if (topBid) {
        setTotalPrice(topBid)
        setAcceptBidStep(AcceptBidStep.Checkout)
      } else {
        setAcceptBidStep(AcceptBidStep.Unavailable)
        setTotalPrice(0)
      }
    }
  }, [token, client, bid, isFetchingBidData])

  const { address } = useAccount()

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
        loading: bidId ? isFetchingBidData || !token : !token,
        token,
        collection,
        source,
        expiration,
        totalPrice,
        bidAmount,
        bidAmountCurrency,
        ethBidAmount,
        fees,
        acceptBidStep,
        transactionError,
        txHash,
        totalUsd,
        usdPrice,
        address,
        etherscanBaseUrl,
        acceptBid,
        setAcceptBidStep,
        stepData,
      })}
    </>
  )
}
