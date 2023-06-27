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
} from '../../hooks'
import { useWalletClient, useAccount } from 'wagmi'
import { Execute } from '@reservoir0x/reservoir-sdk'
import { ExpirationOption } from '../../types/ExpirationOption'
import expirationOptions from '../../lib/defaultExpirationOptions'
import dayjs from 'dayjs'
import { Listings } from '../list/ListModalRenderer'
import { formatUnits, parseUnits, zeroAddress } from 'viem'

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
  normalizeRoyalties?: boolean
  enableOnChainRoyalties: boolean
  children: (props: ChildrenProps) => ReactNode
}

export const EditListingModalRenderer: FC<Props> = ({
  open,
  listingId,
  tokenId,
  collectionId,
  normalizeRoyalties,
  enableOnChainRoyalties = false,
  children,
}) => {
  const { data: wallet } = useWalletClient()
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
    open && listingId ? true : false
  )

  const listing = listings && listings[0] ? listings[0] : undefined
  const contract = listing?.tokenSetId?.split(':')[1]
  const currency = listing?.price?.currency

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

  const client = useReservoirClient()

  const [expirationOption, setExpirationOption] = useState<ExpirationOption>(
    expirationOptions[5]
  )

  const { data: collections } = useCollections(
    open && {
      id: collectionId,
      normalizeRoyalties,
    }
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
    open && {
      tokens: [`${contract}:${tokenId}`],
      includeAttributes: true,
      normalizeRoyalties,
    },
    {
      revalidateFirstPage: true,
    }
  )

  const token = tokens && tokens.length > 0 ? tokens[0] : undefined
  const is1155 = token?.token?.kind === 'erc1155'

  const { data: userTokens } = useUserTokens(
    open && is1155 ? account.address : undefined,
    {
      tokens: [`${contract}:${tokenId}`],
    }
  )

  const quantityAvailable =
    is1155 && userTokens[0]
      ? Number(userTokens[0].ownership?.tokenCount || 1)
      : 1

  const chainCurrency = useChainCurrency()

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

  const editListing = useCallback(() => {
    if (!wallet) {
      const error = new Error('Missing a wallet/signer')
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

    setTransactionError(null)

    let expirationTime: string | null = null

    if (expirationOption.relativeTime && expirationOption.relativeTimeUnit) {
      expirationTime = dayjs()
        .add(expirationOption.relativeTime, expirationOption.relativeTimeUnit)
        .unix()
        .toString()
    }

    const listing: Listings[0] = {
      token: `${contract}:${tokenId}`,
      weiPrice: (
        parseUnits(`${price as number}`, currency?.decimals || 18) *
        BigInt(quantity)
      ).toString(),
      orderbook: 'reservoir',
      orderKind: 'seaport-v1.4',
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
      'seaport-v1.4': {
        useOffChainCancellation: true,
        replaceOrderId: listingId,
      },
    }

    setEditListingStep(EditListingStep.Approving)

    client.actions
      .listToken({
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
      .catch((e: any) => {
        const error = e as Error
        const transactionError = new Error(error?.message || '', {
          cause: error,
        })
        setTransactionError(transactionError)
        setEditListingStep(EditListingStep.Edit)
        setStepData(null)
        setSteps(null)
      })
  }, [
    client,
    wallet,
    collectionId,
    tokenId,
    expirationOption,
    price,
    currency,
    quantity,
    contract,
  ])

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
        loading: !listing || !token || !collection,
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
        setPrice,
        setQuantity,
        setExpirationOption,
        setEditListingStep,
        editListing,
      })}
    </>
  )
}
