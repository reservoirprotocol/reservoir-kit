import React, { FC, useEffect, useState, useCallback, ReactNode } from 'react'
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

export enum AcceptBidStep {
  Checkout,
  ApproveMarketplace,
  Confirming,
  Finalizing,
  Complete,
  Unavailable,
}

type ChildrenProps = {
  token?: NonNullable<NonNullable<ReturnType<typeof useTokens>>['data']>[0]
  collection?: NonNullable<ReturnType<typeof useCollections>['data']>[0]
  totalPrice: number
  acceptBidStep: AcceptBidStep
  referrerFee: number
  fees: {
    creatorRoyalties: number
    marketplaceFee: number
    referalFee: number
  }
  transactionError?: Error | null
  txHash: string | null
  feeUsd: number
  totalUsd: number
  ethUsdPrice: ReturnType<typeof useCoinConversion>
  address?: string
  etherscanBaseUrl: string
  acceptBid: () => void
  setAcceptBidStep: React.Dispatch<React.SetStateAction<AcceptBidStep>>
}

type Props = {
  open: boolean
  tokenId?: string
  collectionId?: string
  referrerFeeBps?: number
  referrer?: string
  children: (props: ChildrenProps) => ReactNode
}

export const AcceptBidModalRenderer: FC<Props> = ({
  open,
  tokenId,
  collectionId,
  referrer,
  referrerFeeBps,
  children,
}) => {
  const { data: signer } = useSigner()
  const [totalPrice, setTotalPrice] = useState(0)
  const [referrerFee, setReferrerFee] = useState(0)
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
  const feeUsd = referrerFee * (ethUsdPrice || 0)
  const totalUsd = totalPrice * (ethUsdPrice || 0)

  const client = useReservoirClient()

  const marketplaceFee = (client?.fee ? +client?.fee : 0) / 10000

  const fees = {
    creatorRoyalties: collection?.royalties?.bps || 0,
    marketplaceFee,
    referalFee: referrerFee,
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

    if (referrer && referrerFeeBps) {
      options.referrer = referrer
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

          if (currentStepItem) {
            if (currentStepItem.txHash) {
              setTxHash(currentStepItem.txHash)
              setAcceptBidStep(AcceptBidStep.Finalizing)
            } else if (currentStepIndex !== steps.length - 1) {
              setAcceptBidStep(AcceptBidStep.ApproveMarketplace)
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
        console.log(error)
      })
  }, [
    tokenId,
    collectionId,
    referrer,
    referrerFeeBps,
    client,
    signer,
    totalPrice,
  ])

  useEffect(() => {
    if (token) {
      let topBid = token.market?.topBid?.price?.amount?.native
      if (topBid) {
        if (referrerFeeBps) {
          const fee = (referrerFeeBps / 10000) * topBid

          topBid = topBid - fee
          setReferrerFee(fee)
        } else if (client?.fee && client?.feeRecipient) {
          const fee = (+client.fee / 10000) * topBid

          topBid = topBid - fee
          setReferrerFee(fee)
        }
        setTotalPrice(topBid)
        setAcceptBidStep(AcceptBidStep.Checkout)
      } else {
        setAcceptBidStep(AcceptBidStep.Unavailable)
        setTotalPrice(0)
      }
    }
  }, [token, referrerFeeBps, client])

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
      setTransactionError(null)
    }
  }, [open])

  return (
    <>
      {children({
        token,
        collection,
        totalPrice,
        referrerFee,
        fees,
        acceptBidStep,
        transactionError,
        txHash,
        feeUsd,
        totalUsd,
        ethUsdPrice,
        address: address,
        etherscanBaseUrl,
        acceptBid,
        setAcceptBidStep,
      })}
    </>
  )
}
