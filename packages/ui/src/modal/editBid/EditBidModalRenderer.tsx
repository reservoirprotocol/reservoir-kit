import React, {
  FC,
  useEffect,
  useState,
  useCallback,
  ReactNode,
  useMemo,
  useContext,
} from 'react'
import {
  useCoinConversion,
  useReservoirClient,
  useTokens,
  useCollections,
  useChainCurrency,
  useAttributes,
  useMarketplaces,
  useUserBids,
} from '../../hooks'
import {
  useWalletClient,
  useAccount,
  useBalance,
  useConfig,
  useReadContracts,
} from 'wagmi'
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
import { Address, WalletClient, erc20Abi, parseUnits } from 'viem'
import { getAccount, switchChain } from 'wagmi/actions'
import { customChains } from '@reservoir0x/reservoir-sdk'
import * as allChains from 'viem/chains'
import { Marketplace } from '../../hooks/useMarketplaces'
import { ProviderOptionsContext } from '../../ReservoirKitProvider'
import { useCapabilities } from 'wagmi/experimental'

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
  bid?: NonNullable<ReturnType<typeof useUserBids>['data']>[0]
  attributes?: Traits
  trait: Trait
  tokenId?: string
  contract?: string
  isOracleOrder: boolean
  isTokenBid: boolean
  quantity: number
  setQuantity: React.Dispatch<React.SetStateAction<number>>
  bidAmountPerUnit: string
  totalBidAmount: number
  totalBidAmountUsd: number
  usdPrice: number | null
  token?: NonNullable<NonNullable<ReturnType<typeof useTokens>>['data']>[0]
  currency: NonNullable<
    NonNullable<ReturnType<typeof useUserBids>['data']>[0]['price']
  >['currency']
  collection?: NonNullable<ReturnType<typeof useCollections>['data']>[0]
  editBidStep: EditBidStep
  transactionError?: Error | null
  hasEnoughNativeCurrency: boolean
  hasEnoughWrappedCurrency: boolean
  hasAuxiliaryFundsSupport: boolean
  balance?: FetchBalanceResult
  wrappedBalance?: [bigint, number, string]
  wrappedContractName: string
  wrappedContractAddress: string
  amountToWrap: string
  canAutomaticallyConvert: boolean
  convertLink: string
  royaltyBps?: number
  expirationOptions: ExpirationOption[]
  expirationOption: ExpirationOption
  steps: Execute['steps'] | null
  stepData: EditBidStepData | null
  exchange?: Exchange
  traitBidSupported: boolean
  collectionBidSupported: boolean
  partialBidSupported: boolean
  setTrait: React.Dispatch<React.SetStateAction<Trait>>
  setBidAmountPerUnit: React.Dispatch<React.SetStateAction<string>>
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
  const providerOptions = useContext(ProviderOptionsContext)
  const client = useReservoirClient()
  const currentChain = client?.currentChain()
  const config = useConfig()
  const { address, connector } = useAccount()

  const rendererChain = chainId
    ? client?.chains.find(({ id }) => id === chainId) || currentChain
    : currentChain

  const wagmiChain: allChains.Chain | undefined = Object.values({
    ...allChains,
    ...customChains,
  }).find(({ id }) => rendererChain?.id === id)

  const { data: wallet } = useWalletClient({ chainId: rendererChain?.id })
  const { data: capabilities } = useCapabilities({
    query: {
      enabled:
        connector &&
        (connector.id === 'coinbaseWalletSDK' || connector.id === 'coinbase'),
    },
  })
  const hasAuxiliaryFundsSupport = Boolean(
    rendererChain?.id
      ? capabilities?.[rendererChain?.id]?.auxiliaryFunds?.supported
      : false
  )

  const [editBidStep, setEditBidStep] = useState<EditBidStep>(EditBidStep.Edit)
  const [transactionError, setTransactionError] = useState<Error | null>()
  const [stepData, setStepData] = useState<EditBidStepData | null>(null)
  const [steps, setSteps] = useState<Execute['steps'] | null>(null)

  const [bidAmountPerUnit, setBidAmountPerUnit] = useState<string>('')
  const [quantity, setQuantity] = useState(1)

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

  const { data: bids } = useUserBids(
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

  const [allMarketplaces] = useMarketplaces(
    collectionId,
    tokenId,
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

    const exchange = Object.values(exchanges).find(
      (exchange) => exchange?.orderKind === bid?.kind
    )

    return exchange?.enabled ? exchange : undefined
  }, [reservoirMarketplace, bid])

  const traitBidSupported = Boolean(exchange?.traitBidSupported)
  const collectionBidSupported = Boolean(exchange?.collectionBidSupported)
  const partialBidSupported = Boolean(exchange?.partialOrderSupported)

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
      setBidAmountPerUnit(bid?.price?.amount?.decimal.toString())
    }
    if (bid?.quantityRemaining && bid?.quantityRemaining > 1) {
      setQuantity(bid?.quantityRemaining)
    }
    //@ts-ignore
    if (bid?.criteria?.kind == 'attribute' && bid?.criteria?.data.attribute) {
      //@ts-ignore
      setTrait(bid?.criteria?.data?.attribute)
    }
  }, [bid])

  const coinConversion = useCoinConversion(
    open && bid ? 'USD' : undefined,
    wrappedContractName
  )
  const usdPrice = coinConversion.length > 0 ? coinConversion[0].price : null

  const totalBidAmount = Number(bidAmountPerUnit) * Math.max(1, quantity)
  const totalBidAmountUsd = totalBidAmount * (usdPrice || 0)

  const { data: balance } = useBalance({
    address: address,
    chainId: rendererChain?.id,
    query: {
      enabled: open,
    },
  })

  const { data: wrappedBalance } = useReadContracts({
    allowFailure: false,
    contracts: [
      {
        address: wrappedContractAddress as Address,
        abi: erc20Abi,
        functionName: 'balanceOf',
        chainId: rendererChain?.id,
        args: [address as Address],
      },
      {
        address: wrappedContractAddress as Address,
        abi: erc20Abi,
        functionName: 'decimals',
        chainId: rendererChain?.id,
      },
      {
        address: wrappedContractAddress as Address,
        abi: erc20Abi,
        functionName: 'symbol',
        chainId: rendererChain?.id,
      },
    ],
    query: {
      enabled: Boolean(open && address !== undefined),
    },
  })

  const canAutomaticallyConvert =
    !currency || currency.contract === nativeWrappedContractAddress
  let convertLink: string = ''

  if (providerOptions?.convertLink) {
    convertLink =
      providerOptions.convertLink.tokenUrl ??
      providerOptions.convertLink.chainUrl ??
      ''
    if (rendererChain?.id) {
      convertLink = convertLink.replace('{toChain}', `${rendererChain.id}`)
    }
    convertLink = convertLink.replace('{toToken}', wrappedContractAddress)
  } else if (canAutomaticallyConvert) {
    convertLink =
      wagmiChain?.id === mainnet.id || wagmiChain?.id === goerli.id
        ? `https://app.uniswap.org/#/swap?theme=dark&exactAmount=${amountToWrap}&chain=mainnet&inputCurrency=eth&outputCurrency=${wrappedContractAddress}`
        : `https://app.uniswap.org/#/swap?theme=dark&exactAmount=${amountToWrap}`
  } else if (rendererChain?.id === allChains.skaleNebula.id) {
    convertLink = `https://portal.skale.space/bridge?from=mainnet&to=green-giddy-denebola&token=eth&type=eth`
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
    if (totalBidAmount !== 0) {
      const bid = parseUnits(`${totalBidAmount}`, wrappedBalance?.[1] || 18)

      if (!wrappedBalance?.[0] || wrappedBalance?.[0] < bid) {
        setHasEnoughWrappedCurrency(false)
        const wrappedAmount = wrappedBalance?.[0] || 0n
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
    if (!open) {
      setEditBidStep(EditBidStep.Edit)
      setExpirationOption(expirationOptions[3])
      setHasEnoughNativeCurrency(false)
      setHasEnoughWrappedCurrency(false)
      setAmountToWrap('')
      setBidAmountPerUnit('')
      setStepData(null)
      setTransactionError(null)
      setTrait(undefined)
    } else {
      setTrait(attribute)
    }
  }, [open])

  open
    ? (axios.defaults.headers.common['x-rkui-context'] = 'editBidModalRenderer')
    : delete axios.defaults.headers.common?.['x-rkui-context']

  const editBid = useCallback(async () => {
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

    const atomicBidAmount = parseUnits(
      `${totalBidAmount}`,
      currency?.decimals || 18
    ).toString()

    const bid: BidData = {
      weiPrice: atomicBidAmount,
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

    if (quantity > 1) {
      bid.quantity = quantity
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
    config,
    client,
    wallet,
    collectionId,
    tokenId,
    rendererChain,
    expirationOption,
    trait,
    totalBidAmount,
    quantity,
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
        quantity,
        bidAmountPerUnit,
        totalBidAmount,
        totalBidAmountUsd,
        token,
        currency,
        collection,
        editBidStep,
        transactionError,
        hasEnoughNativeCurrency,
        hasEnoughWrappedCurrency,
        hasAuxiliaryFundsSupport,
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
        traitBidSupported,
        partialBidSupported,
        collectionBidSupported,
        setQuantity,
        setTrait,
        setBidAmountPerUnit,
        setExpirationOption,
        setEditBidStep,
        editBid,
      })}
    </>
  )
}
