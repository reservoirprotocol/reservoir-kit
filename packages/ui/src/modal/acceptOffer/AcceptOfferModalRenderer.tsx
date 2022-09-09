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

export enum AcceptOfferStep {
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
  acceptOfferStep: AcceptOfferStep
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
  acceptOffer: () => void
  setAcceptOfferStep: React.Dispatch<React.SetStateAction<AcceptOfferStep>>
}

type Props = {
  open: boolean
  tokenId?: string
  collectionId?: string
  referrerFeeBps?: number
  referrer?: string
  children: (props: ChildrenProps) => ReactNode
}

export const AcceptOfferModalRenderer: FC<Props> = ({
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
  const [acceptOfferStep, setAcceptOfferStep] = useState<AcceptOfferStep>(
    AcceptOfferStep.Checkout
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
    creatorRoyalties: 0,
    marketplaceFee,
    referalFee: referrerFee,
  }

  const acceptOffer = useCallback(() => {
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
      throw error
    }

    const options: Parameters<
      ReservoirClientActions['acceptOffer']
    >['0']['options'] = {}

    if (referrer && referrerFeeBps) {
      options.referrer = referrer
    }

    setAcceptOfferStep(AcceptOfferStep.Confirming)

    client.actions
      .acceptOffer({
        expectedPrice: totalPrice,
        signer,
        token: {
          tokenId: tokenId,
          contract: collectionId,
        },
        onProgress: (steps: Execute['steps']) => {
          if (!steps) {
            return
          }

          let currentStepItem:
            | NonNullable<Execute['steps'][0]['items']>[0]
            | undefined
          steps.find((step) => {
            currentStepItem = step.items?.find(
              (item) => item.status === 'incomplete'
            )
            return currentStepItem
          })

          if (currentStepItem) {
            if (currentStepItem.txHash) {
              setTxHash(currentStepItem.txHash)
              setAcceptOfferStep(AcceptOfferStep.Finalizing)
            } else {
              setAcceptOfferStep(AcceptOfferStep.Confirming)
            }
          } else if (
            steps.every(
              (step) =>
                !step.items ||
                step.items.length == 0 ||
                step.items?.every((item) => item.status === 'complete')
            )
          ) {
            setAcceptOfferStep(AcceptOfferStep.Complete)
          }
        },
        options,
      })
      .catch((e: any) => {
        const error = e as Error
        setAcceptOfferStep(AcceptOfferStep.Checkout)
        console.log(error)
      })
  }, [tokenId, collectionId, referrer, referrerFeeBps, client, signer])

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
        setAcceptOfferStep(AcceptOfferStep.Checkout)
      } else {
        setAcceptOfferStep(AcceptOfferStep.Unavailable)
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
      setAcceptOfferStep(AcceptOfferStep.Checkout)
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
        acceptOfferStep,
        transactionError,
        txHash,
        feeUsd,
        totalUsd,
        ethUsdPrice,
        address: address,
        etherscanBaseUrl,
        acceptOffer,
        setAcceptOfferStep,
      })}
    </>
  )
}
