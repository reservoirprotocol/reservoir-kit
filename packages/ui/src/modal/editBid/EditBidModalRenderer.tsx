import React, {
  FC,
  useEffect,
  useState,
  useCallback,
  ReactNode,
  useMemo,
} from 'react'
import {
  useCoinConversion,
  useReservoirClient,
  useTokens,
  useCollections,
  useChainCurrency,
  useBids,
  useAttributes,
  useMarketplaces,
} from '../../hooks'
import { useWalletClient, useAccount, useBalance } from 'wagmi'
import { mainnet, goerli } from 'wagmi/chains'

import { Execute, ReservoirWallet, axios } from '@reservoir0x/reservoir-sdk'
import { ExpirationOption } from '../../types/ExpirationOption'
import expirationOptions from '../../lib/defaultExpirationOptions'
import dayjs from 'dayjs'
import wrappedContractNames from '../../constants/wrappedContractNames'
import wrappedContracts from '../../constants/wrappedContracts'
import {
  BidData,
  FetchBalanceResult,
  Trait,
  Traits,
} from '../bid/BidModalRenderer'
import { formatBN } from '../../lib/numbers'
import { WalletClient, parseUnits } from 'viem'
import { getNetwork, switchNetwork } from 'wagmi/actions'
import { customChains } from '@reservoir0x/reservoir-sdk'
import * as allChains from 'viem/chains'
import { Marketplace } from '../../hooks/useMarketplaces'

type Exchange = NonNullable<Marketplace['exchanges']>['string']

export enum EditBidStep {
  Edit,
  Approving,
  Complete,
}

export type EditBidStepData = {
  totalSteps: number
  stepProgress: number
  currentStep: Execute['steps'][0]
  currentStepItem: NonNullable<Execute['steps'][0]['items']>[0]
}

type ChildrenProps = {
  loading: boolean
  bid?: NonNullable<ReturnType<typeof useBids>['data']>[0]
  attributes?: Traits
  trait: Trait
  tokenId?: string
  contract?: string
  isOracleOrder: boolean
  isTokenBid: boolean
  bidAmount: string
  bidAmountUsd: number
  token?: NonNullable<NonNullable<ReturnType<typeof useTokens>>['data']>[0]
  currency: NonNullable<
    NonNullable<ReturnType<typeof useBids>['data']>[0]['price']
  >['currency']
  collection?: NonNullable<ReturnType<typeof useCollections>['data']>[0]
  editBidStep: EditBidStep
  transactionError?: Error | null
  hasEnoughNativeCurrency: boolean
  hasEnoughWrappedCurrency: boolean
  balance?: FetchBalanceResult
  wrappedBalance?: FetchBalanceResult
  wrappedContractName: string
  wrappedContractAddress: string
  amountToWrap: string
  canAutomaticallyConvert: boolean
  convertLink: string
  royaltyBps?: number
  expirationOptions: ExpirationOption[]
  expirationOption: ExpirationOption
  usdPrice: number
  steps: Execute['steps'] | null
  stepData: EditBidStepData | null
  exchange?: Exchange
  setTrait: React.Dispatch<React.SetStateAction<Trait>>
  setBidAmount: React.Dispatch<React.SetStateAction<string>>
  setExpirationOption: React.Dispatch<React.SetStateAction<ExpirationOption>>
  setEditBidStep: React.Dispatch<React.SetStateAction<EditBidStep>>
  editBid: () => void
}

type Props = {
  open: boolean
  bidId?: string
  chainId?: number
  tokenId?: string
  attribute?: Trait
  collectionId?: string
  normalizeRoyalties?: boolean
  children: (props: ChildrenProps) => ReactNode
  walletClient?: ReservoirWallet | WalletClient
}

export const EditBidModalRenderer: FC<Props> = ({
  open,
  bidId,
  chainId,
  tokenId,
  collectionId,
  attribute,
  normalizeRoyalties,
  walletClient,
  children,
}) => {
  const client = useReservoirClient()
  const currentChain = client?.currentChain()

  const rendererChain = chainId
    ? client?.chains.find(({ id }) => id === chainId) || currentChain
    : currentChain

  const wagmiChain: allChains.Chain | undefined = Object.values({
    ...allChains,
    ...customChains,
  }).find(({ id }) => rendererChain?.id === id)

  const { data: wallet } = useWalletClient({ chainId: rendererChain?.id })

  const [editBidStep, setEditBidStep] = useState<EditBidStep>(EditBidStep.Edit)
  const [transactionError, setTransactionError] = useState<Error | null>()
  const [stepData, setStepData] = useState<EditBidStepData | null>(null)
  const [steps, setSteps] = useState<Execute['steps'] | null>(null)
  const [bidAmount, setBidAmount] = useState<string>('')
  const [expirationOption, setExpirationOption] = useState<ExpirationOption>(
    expirationOptions[5]
  )
  const [hasEnoughNativeCurrency, setHasEnoughNativeCurrency] = useState(false)
  const [hasEnoughWrappedCurrency, setHasEnoughWrappedCurrency] =
    useState(false)
  const [amountToWrap, setAmountToWrap] = useState('')
  const [trait, setTrait] = useState<Trait>(attribute)
  const [attributes, setAttributes] = useState<Traits>()
  const chainCurrency = useChainCurrency(rendererChain?.id)

  const nativeWrappedContractAddress =
    chainCurrency.chainId in wrappedContracts
      ? wrappedContracts[chainCurrency.chainId]
      : wrappedContracts[1]
  const nativeWrappedContractName =
    chainCurrency.chainId in wrappedContractNames
      ? wrappedContractNames[chainCurrency.chainId]
      : wrappedContractNames[1]

  const { data: bids } = useBids(
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

  const [allMarketplaces] = useMarketplaces(
    collectionId,
    undefined,
    undefined,
    rendererChain?.id,
    open
  )

  const reservoirMarketplace = useMemo(
    () =>
      allMarketplaces.find(
        (marketplace) => marketplace.orderbook === 'reservoir'
      ),
    [allMarketplaces]
  )

  const exchange = useMemo(() => {
    const exchanges: Record<string, Exchange> =
      reservoirMarketplace?.exchanges || {}
    const exchange = exchanges[bid?.kind as string]
    return exchange?.enabled ? exchange : undefined
  }, [reservoirMarketplace, bid])

  const contract = bid?.tokenSetId?.split(':')[1]
  const currency = bid?.price?.currency

  const isOracleOrder = bid?.isNativeOffChainCancellable as boolean

  const wrappedContractAddress = currency
    ? (currency.contract as string)
    : nativeWrappedContractAddress
  const wrappedContractName = currency
    ? (currency.symbol as string)
    : nativeWrappedContractName

  useEffect(() => {
    if (bid?.price?.amount?.decimal) {
      setBidAmount(bid?.price?.amount?.decimal.toString())
    }
  }, [bid?.price])

  const coinConversion = useCoinConversion(
    open && bid ? 'USD' : undefined,
    wrappedContractName
  )
  const usdPrice = coinConversion.length > 0 ? coinConversion[0].price : 0

  const bidAmountUsd = +bidAmount * (usdPrice || 0)

  const { address } = useAccount()
  const { data: balance } = useBalance({
    address: address,
    watch: open,
    chainId: rendererChain?.id,
  })

  const { data: wrappedBalance } = useBalance({
    token: wrappedContractAddress as any,
    address: address,
    watch: open,
    chainId: rendererChain?.id,
  })

  const canAutomaticallyConvert =
    !currency || currency.contract === nativeWrappedContractAddress
  let convertLink: string = ''

  if (canAutomaticallyConvert) {
    convertLink =
      wagmiChain?.id === mainnet.id || wagmiChain?.id === goerli.id
        ? `https://app.uniswap.org/#/swap?theme=dark&exactAmount=${amountToWrap}&chain=${
            wagmiChain?.network || 'mainnet'
          }&inputCurrency=eth&outputCurrency=${wrappedContractAddress}`
        : `https://app.uniswap.org/#/swap?theme=dark&exactAmount=${amountToWrap}`
  } else {
    convertLink = `https://jumper.exchange/?toChain=${wagmiChain?.id}&toToken=${wrappedContractAddress}`
  }

  const isTokenBid = bid?.criteria?.kind == 'token'

  const { data: traits } = useAttributes(
    open && !isTokenBid ? collectionId : undefined,
    rendererChain?.id
  )

  const { data: collections } = useCollections(
    open && {
      id: collectionId,
      normalizeRoyalties,
    },
    {},
    rendererChain?.id
  )
  const collection = collections && collections[0] ? collections[0] : undefined
  let royaltyBps = collection?.royalties?.bps

  const { data: tokens } = useTokens(
    open && contract && tokenId
      ? {
          tokens: [`${contract}:${tokenId}`],
          includeAttributes: true,
          normalizeRoyalties,
        }
      : false,
    {
      revalidateFirstPage: true,
    },
    rendererChain?.id
  )

  const token = tokens && tokens.length > 0 ? tokens[0] : undefined

  useEffect(() => {
    if (bidAmount !== '') {
      const bid = parseUnits(
        `${Number(bidAmount)}`,
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
  }, [bidAmount, balance, wrappedBalance])

  useEffect(() => {
    const validAttributes = traits
      ? traits.filter(
          (attribute) => attribute.values && attribute.values.length > 0
        )
      : undefined
    setAttributes(validAttributes)
  }, [traits])

  useEffect(() => {
    //@ts-ignore
    if (bid?.criteria?.kind == 'attribute' && bid?.criteria?.data.attribute) {
      //@ts-ignore
      setTrait(bid?.criteria?.data?.attribute)
    }
  }, [bid])

  useEffect(() => {
    if (!open) {
      setEditBidStep(EditBidStep.Edit)
      setExpirationOption(expirationOptions[3])
      setHasEnoughNativeCurrency(false)
      setHasEnoughWrappedCurrency(false)
      setAmountToWrap('')
      setBidAmount('')
      setStepData(null)
      setTransactionError(null)
      setTrait(undefined)
      axios.defaults.headers.common['x-rkui-context'] = ''
    } else {
      axios.defaults.headers.common['x-rkui-context'] = 'editBidModalRenderer'
      setTrait(attribute)
    }
  }, [open])

  const editBid = useCallback(async () => {
    if (!wallet) {
      const error = new Error('Missing a wallet/signer')
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

    if (!client) {
      const error = new Error('ReservoirClient was not initialized')
      setTransactionError(error)
      throw error
    }

    if (!bidId) {
      const error = new Error('Missing bid id to edit')
      setTransactionError(error)
      throw error
    }

    if (!isOracleOrder) {
      const error = new Error('Not an oracle powered offer')
      setTransactionError(error)
      throw error
    }

    if (!exchange) {
      const error = new Error('Missing Exchange')
      setTransactionError(error)
      throw error
    }

    setTransactionError(null)

    let expirationTime: string | null = null

    if (expirationOption.relativeTime && expirationOption.relativeTimeUnit) {
      expirationTime = dayjs()
        .add(expirationOption.relativeTime, expirationOption.relativeTimeUnit)
        .unix()
        .toString()
    }

    const bid: BidData = {
      weiPrice: parseUnits(
        `${Number(bidAmount)}`,
        wrappedBalance?.decimals || 18
      ).toString(),
      orderbook: 'reservoir',
      orderKind: exchange.orderKind as any,
      attributeKey: trait?.key,
      attributeValue: trait?.value,
    }

    if (isTokenBid && tokenId && collectionId) {
      const contract = collectionId ? collectionId?.split(':')[0] : undefined
      bid.token = `${contract}:${tokenId}`
    } else if (collectionId) {
      bid.collection = collectionId
    }

    if (nativeWrappedContractAddress != wrappedContractAddress) {
      bid.currency = wrappedContractAddress
    }

    if (expirationTime) {
      bid.expirationTime = expirationTime
    }

    bid.options = {
      [exchange.orderKind as string]: {
        useOffChainCancellation: true,
        replaceOrderId: bidId,
      },
    }

    setEditBidStep(EditBidStep.Approving)

    client.actions
      .placeBid({
        chainId: rendererChain?.id,
        bids: [bid],
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
            setEditBidStep(EditBidStep.Complete)
          }
        },
      })
      .catch((error: Error) => {
        setTransactionError(error)
        setEditBidStep(EditBidStep.Edit)
        setStepData(null)
        setSteps(null)
      })
  }, [
    client,
    wallet,
    collectionId,
    tokenId,
    rendererChain,
    expirationOption,
    trait,
    bidAmount,
    wrappedBalance,
    wrappedContractAddress,
    nativeWrappedContractAddress,
    exchange,
  ])

  return (
    <>
      {children({
        loading: !bid || !collection,
        bid,
        attributes,
        trait,
        tokenId,
        contract,
        isOracleOrder,
        isTokenBid,
        bidAmount,
        bidAmountUsd,
        token,
        currency,
        collection,
        editBidStep,
        transactionError,
        hasEnoughNativeCurrency,
        hasEnoughWrappedCurrency,
        balance,
        wrappedBalance,
        wrappedContractName,
        wrappedContractAddress,
        amountToWrap,
        convertLink,
        canAutomaticallyConvert,
        royaltyBps,
        expirationOptions,
        expirationOption,
        usdPrice,
        steps,
        stepData,
        exchange,
        setTrait,
        setBidAmount,
        setExpirationOption,
        setEditBidStep,
        editBid,
      })}
    </>
  )
}
