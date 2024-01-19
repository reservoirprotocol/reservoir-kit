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
  useListings,
  useTokens,
  useUserTokens,
  useCollections,
  useOnChainRoyalties,
  useChainCurrency,
  useMarketplaces,
} from '../../hooks'
import { useWalletClient, useAccount } from 'wagmi'
import { Execute, ReservoirWallet, axios } from '@reservoir0x/reservoir-sdk'
import { ExpirationOption } from '../../types/ExpirationOption'
import expirationOptions from '../../lib/defaultExpirationOptions'
import dayjs from 'dayjs'
import { Listing } from '../list/ListModalRenderer'
import { WalletClient, formatUnits, parseUnits, zeroAddress } from 'viem'
import { getNetwork, switchNetwork } from 'wagmi/actions'
import { Marketplace } from '../../hooks/useMarketplaces'

type Exchange = NonNullable<Marketplace['exchanges']>['string']

export enum EditListingStep {
  Edit,
  Approving,
  Complete,
}

export type EditListingStepData = {
  totalSteps: number
  stepProgress: number
  currentStep: Execute['steps'][0]
  currentStepItem: NonNullable<Execute['steps'][0]['items']>[0]
}

type ChildrenProps = {
  loading: boolean
  listing?: NonNullable<ReturnType<typeof useListings>['data']>[0]
  tokenId?: string
  contract?: string
  isOracleOrder: boolean
  price: number | undefined
  token?: NonNullable<NonNullable<ReturnType<typeof useTokens>>['data']>[0]
  currency: NonNullable<
    NonNullable<ReturnType<typeof useListings>['data']>[0]['price']
  >['currency']
  quantityAvailable: number
  collection?: NonNullable<ReturnType<typeof useCollections>['data']>[0]
  quantity: number
  editListingStep: EditListingStep
  transactionError?: Error | null
  totalUsd: number
  royaltyBps?: number
  expirationOptions: ExpirationOption[]
  expirationOption: ExpirationOption
  usdPrice: number
  steps: Execute['steps'] | null
  stepData: EditListingStepData | null
  exchange?: Exchange
  setPrice: React.Dispatch<React.SetStateAction<number | undefined>>
  setQuantity: React.Dispatch<React.SetStateAction<number>>
  setExpirationOption: React.Dispatch<React.SetStateAction<ExpirationOption>>
  setEditListingStep: React.Dispatch<React.SetStateAction<EditListingStep>>
  editListing: () => void
}

type Props = {
  open: boolean
  listingId?: string
  tokenId?: string
  collectionId?: string
  chainId?: number
  normalizeRoyalties?: boolean
  enableOnChainRoyalties: boolean
  children: (props: ChildrenProps) => ReactNode
  walletClient?: ReservoirWallet | WalletClient
}

export const EditListingModalRenderer: FC<Props> = ({
  open,
  listingId,
  tokenId,
  collectionId,
  chainId,
  normalizeRoyalties,
  enableOnChainRoyalties = false,
  children,
  walletClient,
}) => {
  const client = useReservoirClient()
  const currentChain = client?.currentChain()

  const rendererChain = chainId
    ? client?.chains.find(({ id }) => id === chainId) || currentChain
    : currentChain

  const { data: wagmiWalletClient } = useWalletClient({
    chainId: rendererChain?.id,
  })
  const wallet = walletClient || wagmiWalletClient
  const account = useAccount()
  const [editListingStep, setEditListingStep] = useState<EditListingStep>(
    EditListingStep.Edit
  )
  const [transactionError, setTransactionError] = useState<Error | null>()
  const [stepData, setStepData] = useState<EditListingStepData | null>(null)
  const [steps, setSteps] = useState<Execute['steps'] | null>(null)
  const [price, setPrice] = useState<number | undefined>(0)
  const [quantity, setQuantity] = useState(1)

  const { data: listings } = useListings(
    {
      ids: listingId,
      normalizeRoyalties,
      includeCriteriaMetadata: true,
      includeRawData: true,
    },
    {
      revalidateFirstPage: true,
    },
    open && listingId ? true : false,
    rendererChain?.id
  )

  const listing = listings && listings[0] ? listings[0] : undefined
  const contract = listing?.tokenSetId?.split(':')[1]
  const currency = listing?.price?.currency

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
    const exchange = exchanges[listing?.kind as string]
    return exchange?.enabled ? exchange : undefined
  }, [reservoirMarketplace, listing])

  const isOracleOrder = listing?.isNativeOffChainCancellable as boolean

  useEffect(() => {
    if (listing?.price?.amount?.decimal) {
      setPrice(listing?.price?.amount?.decimal)
    }
  }, [listing?.price])

  const coinConversion = useCoinConversion(
    open && listing ? 'USD' : undefined,
    currency?.symbol
  )
  const usdPrice = coinConversion.length > 0 ? coinConversion[0].price : 0
  const totalUsd = usdPrice * (listing?.price?.amount?.decimal || 0)

  const [expirationOption, setExpirationOption] = useState<ExpirationOption>(
    expirationOptions[5]
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

  useEffect(() => {
    if (!open) {
      setEditListingStep(EditListingStep.Edit)
      setTransactionError(null)
      setStepData(null)
      setExpirationOption(expirationOptions[5])
      setQuantity(1)
    }
  }, [open])

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
  const is1155 = token?.token?.kind === 'erc1155'

  const { data: userTokens } = useUserTokens(
    open && is1155 ? account.address : undefined,
    {
      tokens: [`${contract}:${tokenId}`],
    },
    {},
    rendererChain?.id
  )

  const quantityAvailable =
    is1155 && userTokens[0]
      ? Number(userTokens[0].ownership?.tokenCount || 1)
      : 1

  const chainCurrency = useChainCurrency(rendererChain?.id)

  const { data: onChainRoyalties } = useOnChainRoyalties({
    contract,
    tokenId,
    chainId: chainCurrency.chainId,
    enabled: enableOnChainRoyalties && open,
  })

  const onChainRoyaltyBps = useMemo(() => {
    const totalRoyalty = onChainRoyalties?.[1].reduce((total, royalty) => {
      total += parseFloat(formatUnits(royalty, currency?.decimals || 18))
      return total
    }, 0)
    if (totalRoyalty) {
      return (totalRoyalty / 1) * 10000
    }
    return 0
  }, [onChainRoyalties, chainCurrency])

  if (enableOnChainRoyalties && onChainRoyaltyBps) {
    royaltyBps = onChainRoyaltyBps
  }

  const editListing = useCallback(async () => {
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

    if (!listingId) {
      const error = new Error('Missing list id to edit')
      setTransactionError(error)
      throw error
    }

    if (!isOracleOrder) {
      const error = new Error('Not an oracle order')
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

    const listing: Listing = {
      token: `${contract}:${tokenId}`,
      weiPrice: (
        parseUnits(`${price as number}`, currency?.decimals || 18) *
        BigInt(quantity)
      ).toString(),
      orderbook: 'reservoir',
      orderKind: exchange.orderKind as any,
    }

    if (quantity > 1) {
      listing.quantity = quantity
    }

    if (expirationTime) {
      listing.expirationTime = expirationTime
    }

    if (currency && currency.contract != zeroAddress) {
      listing.currency = currency.contract
    }

    listing.options = {
      [exchange.orderKind as string]: {
        useOffChainCancellation: true,
        replaceOrderId: listingId,
      },
    }

    setEditListingStep(EditListingStep.Approving)

    client.actions
      .listToken({
        chainId: rendererChain?.id,
        listings: [listing],
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
            setEditListingStep(EditListingStep.Complete)
          }
        },
      })
      .catch((error: Error) => {
        setTransactionError(error)
        setEditListingStep(EditListingStep.Edit)
        setStepData(null)
        setSteps(null)
      })
  }, [
    client,
    wallet,
    rendererChain,
    collectionId,
    tokenId,
    expirationOption,
    price,
    currency,
    quantity,
    contract,
    exchange,
  ])

  axios.defaults.headers.common['x-rkui-context'] = open
    ? 'cancelListingModalRenderer'
    : ''

  useEffect(() => {
    if (!open) {
      setEditListingStep(EditListingStep.Edit)
      setTransactionError(null)
      setStepData(null)
      setSteps(null)
    }
  }, [open])

  return (
    <>
      {children({
        loading: !listing || !token || !collection || !exchange,
        listing,
        tokenId,
        contract,
        isOracleOrder,
        currency,
        token,
        price,
        quantityAvailable,
        collection,
        quantity,
        expirationOption,
        expirationOptions,
        editListingStep,
        transactionError,
        usdPrice,
        totalUsd,
        royaltyBps,
        steps,
        stepData,
        exchange,
        setPrice,
        setQuantity,
        setExpirationOption,
        setEditListingStep,
        editListing,
      })}
    </>
  )
}
