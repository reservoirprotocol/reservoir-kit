import React, {
  FC,
  useEffect,
  useState,
  useMemo,
  useCallback,
  ReactNode,
} from 'react'
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
    | NonNullable<
        NonNullable<ReturnType<typeof useTokenDetails>>['tokens']
      >['0']
  collection: ReturnType<typeof useCollection>
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

  const tokenQuery = useMemo(
    () => ({
      tokens: [`${collectionId}:${tokenId}`],
    }),
    [collectionId, tokenId]
  )

  const collectionQuery = useMemo(
    () => ({
      id: collectionId,
    }),
    [collectionId]
  )

  const tokenDetails = useTokenDetails(open && tokenQuery)
  const collection = useCollection(open && collectionQuery)
  let token = !!tokenDetails?.tokens?.length && tokenDetails?.tokens[0]

  const ethUsdPrice = useEthConversion(open ? 'USD' : undefined)
  const feeUsd = referrerFee * (ethUsdPrice || 0)
  const totalUsd = totalPrice * (ethUsdPrice || 0)

  const client = useReservoirClient()

  const buyToken = useCallback(() => {
    if (!signer) {
      throw 'Missing a signer'
    }

    if (!tokenId || !collectionId) {
      throw 'Missing tokenId or collectionId'
    }

    if (!client) {
      throw 'ReservoirClient was not initialized'
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

          const currentStep = steps.find((step) => step.status === 'incomplete')

          if (currentStep) {
            if (currentStep.txHash) {
              setTxHash(currentStep.txHash)
              setBuyStep(BuyStep.Finalizing)
            } else {
              setBuyStep(BuyStep.Confirming)
            }
          } else if (steps.every((step) => step.status === 'complete')) {
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
        }
        setTotalPrice(floorPrice)
      } else {
        setBuyStep(BuyStep.Unavailable)
        setTotalPrice(0)
      }
    }
  }, [tokenDetails, referrerFeeBps])

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
