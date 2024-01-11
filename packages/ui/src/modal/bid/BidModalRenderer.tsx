import React, {
  FC,
  useEffect,
  useState,
  useCallback,
  ReactNode,
  useMemo,
} from 'react'
import {
  useTokens,
  useCoinConversion,
  useReservoirClient,
  useCollections,
  useAttributes,
  useChainCurrency,
  useMarketplaces,
} from '../../hooks'
import { useAccount, useBalance, useWalletClient } from 'wagmi'
import { mainnet, goerli } from 'wagmi/chains'

import {
  Execute,
  ReservoirClientActions,
  ReservoirWallet,
  axios,
} from '@reservoir0x/reservoir-sdk'
import { ExpirationOption } from '../../types/ExpirationOption'
import defaultExpirationOptions from '../../lib/defaultExpirationOptions'
import { formatBN } from '../../lib/numbers'

import dayjs from 'dayjs'
import wrappedContractNames from '../../constants/wrappedContractNames'
import wrappedContracts from '../../constants/wrappedContracts'
import { Currency } from '../../types/Currency'
import { WalletClient, parseUnits, zeroAddress } from 'viem'
import { getNetwork, switchNetwork } from 'wagmi/actions'
import { customChains } from '@reservoir0x/reservoir-sdk'
import * as allChains from 'viem/chains'
import { Marketplace } from '../../hooks/useMarketplaces'

const expirationOptions = [
  ...defaultExpirationOptions,
  {
    text: 'Custom',
    value: 'custom',
    relativeTime: null,
    relativeTimeUnit: null,
  },
]

export type FetchBalanceResult = {
  decimals: number
  formatted: string
  symbol: string
  value: bigint
}

export enum BidStep {
  SetPrice,
  Offering,
  Complete,
  Unavailable,
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

type Exchange = NonNullable<Marketplace['exchanges']>['string']

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
  loading: boolean
  traitBidSupported: boolean
  collectionBidSupported: boolean
  partialBidSupported: boolean
  amountToWrap: string
  usdPrice: number | null
  balance?: FetchBalanceResult
  wrappedBalance?: FetchBalanceResult
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
  exchange?: Exchange
  feeBps?: number
  setCurrency: (currency: Currency) => void
  setBidStep: React.Dispatch<React.SetStateAction<BidStep>>
  setBidAmountPerUnit: React.Dispatch<React.SetStateAction<string>>
  setExpirationOption: React.Dispatch<React.SetStateAction<ExpirationOption>>
  setTrait: React.Dispatch<React.SetStateAction<Trait>>
  trait: Trait
  placeBid: (options?: { royaltyBps?: number }) => void
}

type Props = {
  open: boolean
  tokenId?: string
  chainId?: number
  collectionId?: string
  attribute?: Trait
  normalizeRoyalties?: boolean
  currencies?: Currency[]
  oracleEnabled: boolean
  feesBps?: string[] | null
  orderKind?: BidData['orderKind']
  children: (props: ChildrenProps) => ReactNode
  walletClient?: ReservoirWallet | WalletClient
  usePermit?: boolean
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
  chainId,
  collectionId,
  orderKind,
  attribute,
  normalizeRoyalties,
  currencies: preferredCurrencies,
  oracleEnabled = false,
  feesBps,
  children,
  walletClient,
  usePermit,
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

  const { data: wagmiWallet } = useWalletClient({ chainId: rendererChain?.id })

  const wallet = walletClient || wagmiWallet

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
  const chainCurrency = useChainCurrency(rendererChain?.id)
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
    preferredCurrencies && preferredCurrencies[0]
      ? preferredCurrencies[0]
      : defaultCurrency
  )
  const [currencies, setCurrencies] = useState<Currency[] | undefined>(
    preferredCurrencies
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
    },
    rendererChain?.id
  )

  const { data: traits } = useAttributes(
    open && !tokenId ? collectionId : undefined,
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

  const token = tokens && tokens.length > 0 ? tokens[0] : undefined
  const usdConversion = useCoinConversion(
    open ? 'USD' : undefined,
    wrappedContractName
  )
  const usdPrice = usdConversion.length > 0 ? usdConversion[0].price : null
  const totalBidAmount = Number(bidAmountPerUnit) * Math.max(1, quantity)
  const totalBidAmountUsd = totalBidAmount * (usdPrice || 0)

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
    const exchange = orderKind
      ? exchanges[orderKind]
      : Object.values(exchanges).find((exchange) => exchange?.enabled)
    return exchange?.enabled ? exchange : undefined
  }, [reservoirMarketplace, orderKind])

  const traitBidSupported = Boolean(exchange?.traitBidSupported)
  const collectionBidSupported = Boolean(exchange?.collectionBidSupported)
  const partialBidSupported = Boolean(exchange?.partialOrderSupported)

  // Set bid step to unavailable if collection bid is not supported
  useEffect(() => {
    if (open && !tokenId && reservoirMarketplace && !collectionBidSupported) {
      setBidStep(BidStep.Unavailable)
    } else {
      setBidStep(BidStep.SetPrice)
    }
  }, [open, tokenId, reservoirMarketplace, collectionBidSupported])

  const { address } = useAccount()
  const { data: balance } = useBalance({
    address: address,
    watch: open,
    chainId: rendererChain?.id,
  })

  const { data: wrappedBalance } = useBalance({
    token:
      wrappedContractAddress !== zeroAddress
        ? (wrappedContractAddress as any)
        : undefined,
    address: address,
    watch: open,
    chainId: rendererChain?.id,
  })

  const canAutomaticallyConvert =
    !currency ||
    currency.contract.toLowerCase() ===
      nativeWrappedContractAddress.toLowerCase()
  let convertLink: string = ''

  if (canAutomaticallyConvert) {
    convertLink =
      rendererChain?.id === mainnet.id || rendererChain?.id === goerli.id
        ? `https://app.uniswap.org/#/swap?theme=dark&exactAmount=${amountToWrap}&chain=${
            wagmiChain?.network || 'mainnet'
          }&inputCurrency=eth&outputCurrency=${wrappedContractAddress}`
        : `https://app.uniswap.org/#/swap?theme=dark&exactAmount=${amountToWrap}`
  } else {
    convertLink = `https://jumper.exchange/?toChain=${rendererChain?.id}&toToken=${wrappedContractAddress}`
  }

  const feeBps: number | undefined = useMemo(() => {
    let bpsFees = feesBps || client?.marketplaceFees
    if (bpsFees) {
      return bpsFees.reduce((total, fee) => {
        const bps = Number(fee.split(':')[1])
        total += bps
        return total
      }, 0)
    }
  }, [feesBps, client?.marketplaceFees, currency])

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
      axios.defaults.headers.common['x-rkui-context'] = ''
    } else {
      axios.defaults.headers.common['x-rkui-context'] = 'bidModalRenderer'
      setTrait(attribute)
    }
    setCurrency(currencies && currencies[0] ? currencies[0] : defaultCurrency)
  }, [open])

  useEffect(() => {
    const supportedCurrencies =
      exchange?.supportedBidCurrencies?.map((currency) =>
        currency.toLowerCase()
      ) || []
    if (exchange?.paymentTokens) {
      const restrictedCurrencies = exchange.paymentTokens
        .filter(
          (token) =>
            token.address &&
            token.symbol &&
            supportedCurrencies.includes(token.address.toLowerCase())
        )
        .map((token) => ({
          contract: token.address as string,
          decimals: token.decimals,
          name: token.name,
          symbol: token.symbol as string,
        }))
      setCurrencies(restrictedCurrencies)

      if (
        !restrictedCurrencies.find(
          (c) => currency.contract.toLowerCase() == c.contract.toLowerCase()
        )
      ) {
        setCurrency(restrictedCurrencies[0])
      }
    } else {
      const currencies = preferredCurrencies?.filter((currency) =>
        currency.contract.toLowerCase()
      )
      setCurrency(currencies && currencies[0] ? currencies[0] : defaultCurrency)
      setCurrencies(preferredCurrencies)
    }
  }, [exchange, open])

  useEffect(() => {
    if (currencies && currencies.length > 5) {
      console.warn(
        'The BidModal UI was designed to have a maximum of 5 currencies, going above 5 may degrade the user experience.'
      )
    }
  }, [currencies])

  const placeBid = useCallback(
    async (options?: { royaltyBps?: number }) => {
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

      if (!tokenId && !collectionBidSupported) {
        const error = new Error(
          'Collection bids are not supported for this collection'
        )
        setTransactionError(error)
        throw error
      }

      if (!exchange) {
        const error = new Error('Missing Exchange')
        setTransactionError(error)
        throw error
      }

      setBidStep(BidStep.Offering)
      setTransactionError(null)
      setBidData(null)

      const atomicBidAmount = parseUnits(
        `${totalBidAmount}`,
        currency?.decimals || 18
      ).toString()

      const bid: BidData = {
        weiPrice: atomicBidAmount,
        orderbook: 'reservoir',
        orderKind:
          orderKind ||
          (exchange?.orderKind as BidData['orderKind']) ||
          'seaport',
        attributeKey: traitBidSupported ? trait?.key : undefined,
        attributeValue: traitBidSupported ? trait?.value : undefined,
      }

      if (feesBps && feesBps?.length > 0) {
        bid.marketplaceFees = feesBps
      } else if (!feesBps) {
        delete bid.fees
        delete bid.marketplaceFees
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
            .add(
              expirationOption.relativeTime,
              expirationOption.relativeTimeUnit
            )
            .unix()
            .toString()
        } else {
          bid.expirationTime = `${expirationOption.relativeTime}`
        }
      }

      if (oracleEnabled) {
        bid.options = {
          [exchange.orderKind as string]: {
            useOffChainCancellation: true,
          },
        }
      }

      if (usePermit) {
        bid.usePermit = true
      }

      if (quantity > 1) {
        bid.quantity = quantity
      }

      if (options?.royaltyBps) {
        bid.royaltyBps = options.royaltyBps
      }

      setBidData(bid)

      client.actions
        .placeBid({
          chainId: rendererChain?.id,
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
        .catch((e: Error) => {
          setTransactionError(e)
        })
    },
    [
      tokenId,
      rendererChain,
      collectionId,
      currency,
      client,
      wallet,
      totalBidAmount,
      expirationOption,
      trait,
      quantity,
      feesBps,
      exchange,
      usePermit,
    ]
  )

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
        loading: !collection || !reservoirMarketplace,
        hasEnoughNativeCurrency,
        hasEnoughWrappedCurrency,
        traitBidSupported,
        collectionBidSupported,
        partialBidSupported,
        amountToWrap,
        transactionError,
        expirationOption,
        expirationOptions,
        stepData,
        currencies: currencies || [defaultCurrency],
        currency,
        exchange,
        feeBps,
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
