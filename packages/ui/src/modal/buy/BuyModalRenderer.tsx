import React, { FC, useEffect, useState, useCallback, ReactNode } from 'react'
import {
  useCollection,
  useTokenDetails,
  useEthConversion,
  useReservoirClient,
  useTokenOpenseaBanned,
} from '../../hooks'
import { useAccount, useBalance, useSigner, useNetwork } from 'wagmi'

import { BigNumber, utils } from 'ethers'
import {
  Execute,
  ReservoirClientActions,
} from '@reservoir0x/reservoir-kit-client'

export enum BuyStep {
  Checkout,
  Confirming,
  Finalizing,
  AddFunds,
  Complete,
  Unavailable,
}

type ChildrenProps = {
  token:
    | false
    | NonNullable<NonNullable<ReturnType<typeof useTokenDetails>>['data']>[0]
  collection: ReturnType<typeof useCollection>['data']
  totalPrice: number
  referrerFee: number
  buyStep: BuyStep
  transactionError?: Error | null
  hasEnoughEth: boolean
  txHash: string | null
  feeUsd: number
  totalUsd: number
  ethUsdPrice: ReturnType<typeof useEthConversion>
  isBanned: boolean
  balance?: BigNumber
  address?: string
  etherscanBaseUrl: string
  buyToken: () => void
  setBuyStep: React.Dispatch<React.SetStateAction<BuyStep>>
}

type Props = {
  open: boolean
  tokenId?: string
  collectionId?: string
  referrerFeeBps?: number
  referrer?: string
  children: (props: ChildrenProps) => ReactNode
}

export const BuyModalRenderer: FC<Props> = ({
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
  const [buyStep, setBuyStep] = useState<BuyStep>(BuyStep.Checkout)
  const [transactionError, setTransactionError] = useState<Error | null>()
  const [hasEnoughEth, setHasEnoughEth] = useState(true)
  const [txHash, setTxHash] = useState<string | null>(null)
  const { chain: activeChain } = useNetwork()
  const etherscanBaseUrl =
    activeChain?.blockExplorers?.etherscan?.url || 'https://etherscan.io'

  const { data: tokens } = useTokenDetails(
    open && {
      tokens: [`${collectionId}:${tokenId}`],
    }
  )
  const { data: collection } = useCollection(
    open && {
      id: collectionId,
    }
  )
  let token = !!tokens?.length && tokens[0]

  const ethUsdPrice = useEthConversion(open ? 'USD' : undefined)
  const feeUsd = referrerFee * (ethUsdPrice || 0)
  const totalUsd = totalPrice * (ethUsdPrice || 0)

  const client = useReservoirClient()

  const buyToken = useCallback(() => {
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
      ReservoirClientActions['buyToken']
    >['0']['options'] = {}

    if (referrer && referrerFeeBps) {
      options.referrer = referrer
      options.referrerFeeBps = referrerFeeBps
    }

    setBuyStep(BuyStep.Confirming)

    client.actions
      .buyToken({
        expectedPrice: totalPrice,
        signer,
        tokens: [
          {
            tokenId: tokenId,
            contract: collectionId,
          },
        ],
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
              setBuyStep(BuyStep.Finalizing)
            } else {
              setBuyStep(BuyStep.Confirming)
            }
          } else if (
            steps.every(
              (step) =>
                !step.items ||
                step.items.length == 0 ||
                step.items?.every((item) => item.status === 'complete')
            )
          ) {
            setBuyStep(BuyStep.Complete)
          }
        },
        options,
      })
      .catch((e: any) => {
        const error = e as Error
        if (error && error?.message.includes('ETH balance')) {
          setHasEnoughEth(false)
        } else {
          const transactionError = new Error(error?.message || '', {
            cause: error,
          })
          setTransactionError(transactionError)
        }
        setBuyStep(BuyStep.Checkout)
        console.log(error)
      })
  }, [tokenId, collectionId, referrer, referrerFeeBps, client, signer])

  useEffect(() => {
    if (token) {
      if (token.market?.floorAsk?.price) {
        let floorPrice = token.market.floorAsk.price

        if (referrerFeeBps) {
          const fee = (referrerFeeBps / 10000) * floorPrice

          floorPrice = floorPrice + fee
          setReferrerFee(fee)
        } else if (client?.fee && client?.feeRecipient) {
          const fee = (+client.fee / 10000) * floorPrice

          floorPrice = floorPrice + fee
          setReferrerFee(fee)
        }
        setTotalPrice(floorPrice)
        setBuyStep(BuyStep.Checkout)
      } else {
        setBuyStep(BuyStep.Unavailable)
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
        setHasEnoughEth(false)
      } else if (
        balance.value &&
        balance.value.lt(utils.parseEther(`${totalPrice}`))
      ) {
        setHasEnoughEth(false)
      }
    }
  }, [totalPrice, balance])

  useEffect(() => {
    if (!open) {
      setBuyStep(BuyStep.Checkout)
      setTxHash(null)
      setTransactionError(null)
    }
  }, [open])

  const isBanned = useTokenOpenseaBanned(
    open ? collectionId : undefined,
    tokenId
  )

  return (
    <>
      {children({
        token,
        collection,
        totalPrice,
        referrerFee,
        buyStep,
        transactionError,
        hasEnoughEth,
        txHash,
        feeUsd,
        totalUsd,
        ethUsdPrice,
        isBanned,
        balance: balance?.value,
        address: address,
        etherscanBaseUrl,
        buyToken,
        setBuyStep,
      })}
    </>
  )
}
