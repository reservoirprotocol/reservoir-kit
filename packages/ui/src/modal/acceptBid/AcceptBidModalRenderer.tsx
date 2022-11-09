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
import { useAccount, useBalance, useSigner, useNetwork } from 'wagmi'
import { utils } from 'ethers'
import { Execute } from '@reservoir0x/reservoir-kit-client'
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

type OrderSource = NonNullable<
  NonNullable<
    NonNullable<
      NonNullable<NonNullable<ReturnType<typeof useTokens>>['data']>[0]
    >['market']
  >['topBid']
>['source']

type ChildrenProps = {
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

  const { data: tokens } = useTokens(
    open && {
      tokens: [`${collectionId}:${tokenId}`],
      includeTopBid: true,
      normalizeRoyalties,
    },
    {
      revalidateFirstPage: true,
    }
  )
  const { data: collections } = useCollections(
    open && {
      id: collectionId,
      normalizeRoyalties,
    }
  )

  const { data: bids } = useBids(
    {
      ids: bidId,
      status: 'active',
      includeMetadata: true,
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

  const ethUsdPrice = useCoinConversion(open ? 'USD' : undefined)

  const totalUsd = totalPrice * (ethUsdPrice || 0)

  const client = useReservoirClient()

  let feeBreakdown
  let source = undefined
  let expiration = undefined
  let bidAmount = 0
  let bidAmountCurrency = undefined
  let ethBidAmount = undefined

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
    if (bidId) {
      let price = 0
      if (
        bid &&
        bid.status === 'active' &&
        bid.price?.netAmount?.native &&
        bid.metadata?.data?.collectionId === collectionId
      ) {
        if (bid.metadata?.kind === 'token') {
          const tokenSetPieces = bid.tokenSetId.split(':')
          const bidTokenId = tokenSetPieces[tokenSetPieces.length - 1]
          if (tokenId === bidTokenId) {
            price = bid.price?.netAmount?.native
          }
        } else {
          price = bid.price?.netAmount?.native
        }
      }
      setTotalPrice(price)
      setAcceptBidStep(
        price > 0 ? AcceptBidStep.Checkout : AcceptBidStep.Unavailable
      )
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
  }, [token, client, bid])

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
