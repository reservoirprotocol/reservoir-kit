import React, { FC, useEffect, useState, useCallback, ReactNode } from 'react'
import {
  useTokens,
  useCoinConversion,
  useReservoirClient,
  useTokenOpenseaBanned,
  useCollections,
} from '../../hooks'
import { useAccount, useBalance, useSigner, useNetwork } from 'wagmi'

import { BigNumber, utils } from 'ethers'
import {
  Execute,
  ReservoirClientActions,
} from '@reservoir0x/reservoir-kit-client'

export enum BuyStep {
  Checkout,
  Approving,
  AddFunds,
  Complete,
  Unavailable,
}

export type StepData = {
  totalSteps: number
  stepProgress: number
  currentStep: Execute['steps'][0]
  currentStepItem: NonNullable<Execute['steps'][0]['items']>[0]
}

type Token = NonNullable<NonNullable<ReturnType<typeof useTokens>>['data']>[0]

type ChildrenProps = {
  token?: Token
  currency?: NonNullable<
    NonNullable<
      NonNullable<
        NonNullable<NonNullable<Token>['market']>['floorAsk']
      >['price']
    >['currency']
  >
  collection?: NonNullable<ReturnType<typeof useCollections>['data']>[0]
  totalPrice: number
  referrerFee: number
  buyStep: BuyStep
  transactionError?: Error | null
  hasEnoughCurrency: boolean
  feeUsd: number
  totalUsd: number
  usdPrice: ReturnType<typeof useCoinConversion>
  isBanned: boolean
  balance?: BigNumber
  address?: string
  etherscanBaseUrl: string
  steps: Execute['steps'] | null
  stepData: StepData | null
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
  const [hasEnoughCurrency, setHasEnoughCurrency] = useState(true)
  const [stepData, setStepData] = useState<StepData | null>(null)
  const [steps, setSteps] = useState<Execute['steps'] | null>(null)
  const { chain: activeChain } = useNetwork()
  const etherscanBaseUrl =
    activeChain?.blockExplorers?.etherscan?.url || 'https://etherscan.io'

  const { data: tokens } = useTokens(
    open && {
      tokens: [`${collectionId}:${tokenId}`],
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
  const currency = token?.market?.floorAsk?.price?.currency

  const usdPrice = useCoinConversion(
    open && token ? 'USD' : undefined,
    currency?.symbol
  )
  const feeUsd = referrerFee * (usdPrice || 0)
  const totalUsd = totalPrice * (usdPrice || 0)

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
    >['0']['options'] = {
      currency: currency?.contract,
    }

    if (referrer && referrerFeeBps) {
      options.feesOnTop = [`${referrer}:${referrerFeeBps}`]
    }

    setBuyStep(BuyStep.Approving)

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
            setBuyStep(BuyStep.Complete)
          }
        },
        options,
      })
      .catch((e: any) => {
        const error = e as Error
        if (error && error?.message.includes('ETH balance')) {
          setHasEnoughCurrency(false)
        } else {
          const transactionError = new Error(error?.message || '', {
            cause: error,
          })
          setTransactionError(transactionError)
        }
        setBuyStep(BuyStep.Checkout)
        setStepData(null)
        setSteps(null)
        console.log(error)
      })
  }, [
    tokenId,
    collectionId,
    referrer,
    referrerFeeBps,
    client,
    signer,
    currency,
  ])

  useEffect(() => {
    if (token) {
      if (token.market?.floorAsk?.price?.amount?.decimal) {
        let floorPrice = token.market.floorAsk.price.amount.decimal

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
    token: currency?.symbol !== 'ETH' ? currency?.contract : undefined,
    watch: open,
    formatUnits: currency?.decimals,
  })

  useEffect(() => {
    if (balance) {
      if (!balance.value) {
        setHasEnoughCurrency(false)
      } else if (
        balance.value &&
        balance.value.lt(utils.parseUnits(`${totalPrice}`, currency?.decimals))
      ) {
        setHasEnoughCurrency(false)
      }
    }
  }, [totalPrice, balance, currency])

  useEffect(() => {
    if (!open) {
      setBuyStep(BuyStep.Checkout)
      setTransactionError(null)
      setStepData(null)
      setSteps(null)
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
        currency,
        collection,
        totalPrice,
        referrerFee,
        buyStep,
        transactionError,
        hasEnoughCurrency,
        feeUsd,
        totalUsd,
        usdPrice,
        isBanned,
        balance: balance?.value,
        address: address,
        etherscanBaseUrl,
        steps,
        stepData,
        buyToken,
        setBuyStep,
      })}
    </>
  )
}
