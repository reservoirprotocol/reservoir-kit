import React, { FC, useEffect, useState, useCallback, ReactNode } from 'react'
import {
  useTokens,
  useCoinConversion,
  useReservoirClient,
  useCollections,
  useAttributes,
  useChainCurrency,
} from '../../hooks'
import { useAccount, useBalance, useNetwork, useWalletClient } from 'wagmi'
import { mainnet, goerli } from 'wagmi/chains'

import { Execute, ReservoirClientActions } from '@reservoir0x/reservoir-sdk'
import { ExpirationOption } from '../../types/ExpirationOption'
import defaultExpirationOptions from '../../lib/defaultExpirationOptions'
import { formatBN } from '../../lib/numbers'

import dayjs from 'dayjs'
import wrappedContractNames from '../../constants/wrappedContractNames'
import wrappedContracts from '../../constants/wrappedContracts'
import { Currency } from '../../types/Currency'
import { parseUnits } from 'viem'

const expirationOptions = [
  ...defaultExpirationOptions,
  {
    text: 'Custom',
    value: 'custom',
    relativeTime: null,
    relativeTimeUnit: null,
  },
]

export enum BidStep {
  SetPrice,
  Offering,
  Complete,
}

export type Traits =
  | NonNullable<ReturnType<typeof useAttributes>['data']>
  | undefined

export type Trait =
  | {
      key: string
      value: string
      floorAskPrice?: number
    }
  | undefined

type ChildrenProps = {
  token?: NonNullable<NonNullable<ReturnType<typeof useTokens>>['data']>[0]
  collection?: NonNullable<ReturnType<typeof useCollections>['data']>[0]
  attributes?: Traits
  bidAmountPerUnit: string
  totalBidAmount: number
  totalBidAmountUsd: number
  quantity: number
  setQuantity: React.Dispatch<React.SetStateAction<number>>
  bidData: BidData | null
  bidStep: BidStep
  hasEnoughNativeCurrency: boolean
  hasEnoughWrappedCurrency: boolean
  amountToWrap: string
  usdPrice: number | null
  balance?: ReturnType<typeof useBalance>['data']
  wrappedBalance?: ReturnType<typeof useBalance>['data']
  wrappedContractName: string
  wrappedContractAddress: string
  canAutomaticallyConvert: boolean
  convertLink: string
  transactionError?: Error | null
  expirationOptions: ExpirationOption[]
  expirationOption: ExpirationOption
  stepData: BidModalStepData | null
  currencies: Currency[]
  currency: Currency
  setCurrency: (currency: Currency) => void
  setBidStep: React.Dispatch<React.SetStateAction<BidStep>>
  setBidAmountPerUnit: React.Dispatch<React.SetStateAction<string>>
  setExpirationOption: React.Dispatch<React.SetStateAction<ExpirationOption>>
  setTrait: React.Dispatch<React.SetStateAction<Trait>>
  trait: Trait
  placeBid: (options?: { quantity?: number }) => void
}

type Props = {
  open: boolean
  tokenId?: string
  collectionId?: string
  attribute?: Trait
  normalizeRoyalties?: boolean
  currencies?: Currency[]
  oracleEnabled: boolean
  children: (props: ChildrenProps) => ReactNode
}

export type BidData = Parameters<
  ReservoirClientActions['placeBid']
>['0']['bids'][0]

export type BidModalStepData = {
  totalSteps: number
  stepProgress: number
  currentStep: Execute['steps'][0]
}

export const BidModalRenderer: FC<Props> = ({
  open,
  tokenId,
  collectionId,
  attribute,
  normalizeRoyalties,
  currencies,
  oracleEnabled = false,
  children,
}) => {
  const { data: wallet } = useWalletClient()
  const [bidStep, setBidStep] = useState<BidStep>(BidStep.SetPrice)
  const [transactionError, setTransactionError] = useState<Error | null>()
  const [bidAmountPerUnit, setBidAmountPerUnit] = useState<string>('')
  const [quantity, setQuantity] = useState(1)
  const [expirationOption, setExpirationOption] = useState<ExpirationOption>(
    expirationOptions[3]
  )
  const [hasEnoughNativeCurrency, setHasEnoughNativeCurrency] = useState(false)
  const [hasEnoughWrappedCurrency, setHasEnoughWrappedCurrency] =
    useState(false)
  const [amountToWrap, setAmountToWrap] = useState('')
  const [stepData, setStepData] = useState<BidModalStepData | null>(null)
  const [bidData, setBidData] = useState<BidData | null>(null)
  const contract = collectionId ? collectionId?.split(':')[0] : undefined
  const [trait, setTrait] = useState<Trait>(attribute)
  const [attributes, setAttributes] = useState<Traits>()
  const chainCurrency = useChainCurrency()

  const nativeWrappedContractAddress =
    chainCurrency.chainId in wrappedContracts
      ? wrappedContracts[chainCurrency.chainId]
      : wrappedContracts[1]
  const nativeWrappedContractName =
    chainCurrency.chainId in wrappedContractNames
      ? wrappedContractNames[chainCurrency.chainId]
      : wrappedContractNames[1]

  const defaultCurrency = {
    contract: nativeWrappedContractAddress,
    symbol: nativeWrappedContractName,
  }
  const [currency, setCurrency] = useState<Currency>(
    currencies && currencies[0] ? currencies[0] : defaultCurrency
  )

  const wrappedContractAddress = currency
    ? currency.contract
    : nativeWrappedContractAddress
  const wrappedContractName = currency
    ? currency.symbol
    : nativeWrappedContractName

  const { data: tokens } = useTokens(
    open &&
      tokenId !== undefined && {
        tokens: [`${contract}:${tokenId}`],
        includeTopBid: true,
        normalizeRoyalties,
      },
    {
      revalidateFirstPage: true,
    }
  )

  const { data: traits } = useAttributes(
    open && !tokenId ? collectionId : undefined
  )

  const { data: collections } = useCollections(
    open && {
      id: collectionId,
      includeTopBid: true,
      normalizeRoyalties,
    }
  )

  const collection = collections && collections[0] ? collections[0] : undefined

  const token = tokens && tokens.length > 0 ? tokens[0] : undefined
  const usdConversion = useCoinConversion(
    open ? 'USD' : undefined,
    wrappedContractName
  )
  const usdPrice = usdConversion.length > 0 ? usdConversion[0].price : null
  const totalBidAmount = Number(bidAmountPerUnit) * Math.max(1, quantity)
  const totalBidAmountUsd = totalBidAmount * (usdPrice || 0)

  const client = useReservoirClient()

  const { address } = useAccount()
  const { data: balance } = useBalance({
    address: address,
    watch: open,
    chainId: client?.currentChain()?.id,
  })

  const { data: wrappedBalance } = useBalance({
    token: wrappedContractAddress as any,
    address: address,
    watch: open,
    chainId: client?.currentChain()?.id,
  })

  const { chain } = useNetwork()
  const canAutomaticallyConvert =
    !currency || currency.contract === nativeWrappedContractAddress
  let convertLink: string = ''

  if (canAutomaticallyConvert) {
    convertLink =
      chain?.id === mainnet.id || chain?.id === goerli.id
        ? `https://app.uniswap.org/#/swap?theme=dark&exactAmount=${amountToWrap}&chain=${
            chain?.network || 'mainnet'
          }&inputCurrency=eth&outputCurrency=${wrappedContractAddress}`
        : `https://app.uniswap.org/#/swap?theme=dark&exactAmount=${amountToWrap}`
  } else {
    convertLink = `https://jumper.exchange/?toChain=${chain?.id}&toToken=${wrappedContractAddress}`
  }

  useEffect(() => {
    if (totalBidAmount !== 0) {
      const bid = parseUnits(
        `${totalBidAmount}`,
        wrappedBalance?.decimals || 18
      )

      if (!wrappedBalance?.value || wrappedBalance?.value < bid) {
        setHasEnoughWrappedCurrency(false)
        const wrappedAmount = wrappedBalance?.value || 0n
        const amountToWrap = bid - wrappedAmount
        setAmountToWrap(formatBN(amountToWrap, 5))

        if (!balance?.value || balance.value < amountToWrap) {
          setHasEnoughNativeCurrency(false)
        } else {
          setHasEnoughNativeCurrency(true)
        }
      } else {
        setHasEnoughWrappedCurrency(true)
        setHasEnoughNativeCurrency(true)
        setAmountToWrap('')
      }
    } else {
      setHasEnoughNativeCurrency(true)
      setHasEnoughWrappedCurrency(true)
      setAmountToWrap('')
    }
  }, [totalBidAmount, balance, wrappedBalance])

  useEffect(() => {
    const validAttributes = traits
      ? traits.filter(
          (attribute) => attribute.values && attribute.values.length > 0
        )
      : undefined
    setAttributes(validAttributes)
  }, [traits])

  useEffect(() => {
    const validAttributes = traits
      ? traits.filter(
          (attribute) => attribute.values && attribute.values.length > 0
        )
      : undefined
    setAttributes(validAttributes)
  }, [traits])

  useEffect(() => {
    if (!open) {
      setBidStep(BidStep.SetPrice)
      setExpirationOption(expirationOptions[3])
      setHasEnoughNativeCurrency(false)
      setHasEnoughWrappedCurrency(false)
      setAmountToWrap('')
      setBidAmountPerUnit('')
      setQuantity(1)
      setStepData(null)
      setBidData(null)
      setTransactionError(null)
      setTrait(undefined)
    } else {
      setTrait(attribute)
    }
    setCurrency(currencies && currencies[0] ? currencies[0] : defaultCurrency)
  }, [open])

  useEffect(() => {
    if (currencies && currencies.length > 5) {
      console.warn(
        'The BidModal UI was designed to have a maximum of 5 currencies, going above 5 may degrade the user experience.'
      )
    }
  }, [currencies])

  const placeBid = useCallback(() => {
    if (!wallet) {
      const error = new Error('Missing a wallet/signer')
      setTransactionError(error)
      throw error
    }

    if (!tokenId && !collectionId) {
      const error = new Error('Missing tokenId and collectionId')
      setTransactionError(error)
      throw error
    }

    if (!client) {
      const error = new Error('ReservoirClient was not initialized')
      setTransactionError(error)
      throw error
    }

    setBidStep(BidStep.Offering)
    setTransactionError(null)
    setBidData(null)

    const bid: BidData = {
      weiPrice: parseUnits(
        `${totalBidAmount}`,
        currency?.decimals || 18
      ).toString(),
      orderbook: 'reservoir',
      orderKind: 'seaport',
      attributeKey: trait?.key,
      attributeValue: trait?.value,
    }

    if (currency) {
      bid.currency = currency.contract
    }

    if (tokenId && collectionId) {
      const contract = collectionId ? collectionId?.split(':')[0] : undefined
      bid.token = `${contract}:${tokenId}`
    } else if (collectionId) {
      bid.collection = collectionId
    }

    if (expirationOption.relativeTime) {
      if (expirationOption.relativeTimeUnit) {
        bid.expirationTime = dayjs()
          .add(expirationOption.relativeTime, expirationOption.relativeTimeUnit)
          .unix()
          .toString()
      } else {
        bid.expirationTime = `${expirationOption.relativeTime}`
      }
    }

    if (oracleEnabled) {
      bid.options = {
        'seaport-v1.4': {
          useOffChainCancellation: true,
        },
      }
    }

    if (quantity > 1) {
      bid.quantity = quantity
    }

    setBidData(bid)

    client.actions
      .placeBid({
        wallet,
        bids: [bid],
        onProgress: (steps: Execute['steps']) => {
          const executableSteps = steps.filter(
            (step) => step.items && step.items.length > 0
          )

          let stepCount = executableSteps.length
          let incompleteStepItemIndex: number | null = null
          let incompleteStepIndex: number | null = null

          executableSteps.find((step, i) => {
            if (!step.items) {
              return false
            }

            incompleteStepItemIndex = step.items.findIndex(
              (item) => item.status == 'incomplete'
            )
            if (incompleteStepItemIndex !== -1) {
              incompleteStepIndex = i
              return true
            }
          })

          if (incompleteStepIndex !== null) {
            setStepData({
              totalSteps: stepCount,
              stepProgress: incompleteStepIndex,
              currentStep: executableSteps[incompleteStepIndex],
            })
          } else {
            setBidStep(BidStep.Complete)
          }
        },
      })
      .catch((e: any) => {
        const transactionError = new Error(e?.message || '', {
          cause: e,
        })
        setTransactionError(transactionError)
      })
  }, [
    tokenId,
    collectionId,
    currency,
    client,
    wallet,
    totalBidAmount,
    expirationOption,
    trait,
    quantity,
  ])

  return (
    <>
      {children({
        token,
        collection,
        attributes,
        usdPrice,
        balance,
        wrappedBalance,
        wrappedContractName,
        wrappedContractAddress,
        convertLink,
        canAutomaticallyConvert,
        bidAmountPerUnit,
        totalBidAmount,
        quantity,
        setQuantity,
        bidData,
        totalBidAmountUsd,
        bidStep,
        hasEnoughNativeCurrency,
        hasEnoughWrappedCurrency,
        amountToWrap,
        transactionError,
        expirationOption,
        expirationOptions,
        stepData,
        currencies: currencies || [defaultCurrency],
        currency,
        setCurrency,
        setBidStep,
        setBidAmountPerUnit,
        setExpirationOption,
        setTrait,
        trait,
        placeBid,
      })}
    </>
  )
}
