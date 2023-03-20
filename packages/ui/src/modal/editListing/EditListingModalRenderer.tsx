import React, { FC, useEffect, useState, useCallback, ReactNode } from 'react'
import {
  useCoinConversion,
  useReservoirClient,
  useListings,
  useTokens,
  useUserTokens,
  useCollections,
  useMarketplaces,
} from '../../hooks'
import { useSigner, useNetwork, useAccount } from 'wagmi'
import { Execute } from '@reservoir0x/reservoir-sdk'
import { ExpirationOption } from '../../types/ExpirationOption'
import expirationOptions from '../../lib/defaultExpirationOptions'
import dayjs from 'dayjs'
import { constants } from 'ethers'
import { Listings } from '../list/ListModalRenderer'
import { parseUnits } from 'ethers/lib/utils.js'

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
  token?: NonNullable<NonNullable<ReturnType<typeof useTokens>>['data']>[0]
  quantityAvailable: number
  collection?: NonNullable<ReturnType<typeof useCollections>['data']>[0]
  quantity: number
  setQuantity: React.Dispatch<React.SetStateAction<number>>
  editListingStep: EditListingStep
  transactionError?: Error | null
  totalUsd: number
  usdPrice: ReturnType<typeof useCoinConversion>
  blockExplorerBaseUrl: string
  steps: Execute['steps'] | null
  stepData: EditListingStepData | null
  setEditListingStep: React.Dispatch<React.SetStateAction<EditListingStep>>
  editListing: () => void
}

type Props = {
  open: boolean
  listingId?: string
  tokenId?: string
  collectionId?: string
  normalizeRoyalties?: boolean
  children: (props: ChildrenProps) => ReactNode
}

export const EditListingModalRenderer: FC<Props> = ({
  open,
  listingId,
  tokenId,
  collectionId,
  normalizeRoyalties,
  children,
}) => {
  const { data: signer } = useSigner()
  const account = useAccount()
  const [editListingStep, setEditListingStep] = useState<EditListingStep>(
    EditListingStep.Edit
  )
  const [transactionError, setTransactionError] = useState<Error | null>()
  const [stepData, setStepData] = useState<EditListingStepData | null>(null)
  const [steps, setSteps] = useState<Execute['steps'] | null>(null)
  const [quantity, setQuantity] = useState(1)
  const { chain: activeChain } = useNetwork()
  const blockExplorerBaseUrl =
    activeChain?.blockExplorers?.default.url || 'https://etherscan.io'

  const { data: listings, isFetchingPage } = useListings(
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
  const currency = listing?.price?.currency

  const coinConversion = useCoinConversion(
    open && listing ? 'USD' : undefined,
    currency?.symbol
  )
  const usdPrice =
    coinConversion !== undefined && coinConversion !== null
      ? Number(coinConversion)
      : 0
  const totalUsd = usdPrice * (listing?.price?.amount?.decimal || 0)

  const client = useReservoirClient()

  const [expirationOption, setExpirationOption] = useState<ExpirationOption>(
    expirationOptions[5]
  )

  // const contract = listing?.contract
  const contract = listing?.tokenSetId?.split(':')[1]

  const { data: collections } = useCollections(
    open && {
      id: collectionId,
      normalizeRoyalties,
    }
  )
  const collection = collections && collections[0] ? collections[0] : undefined

  let royaltyBps = collection?.royalties?.bps

  const [marketplaces, setMarketplaces] = useMarketplaces(true, royaltyBps)

  useEffect(() => {
    setMarketplaces(
      marketplaces.filter(
        (marketplace) => marketplace.orderbook === 'reservoir'
      )
    )
  }, [marketplaces.length])

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

  const editListing = useCallback(() => {
    if (!signer) {
      const error = new Error('Missing a signer')
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

    setTransactionError(null)

    let expirationTime: string | null = null

    if (expirationOption.relativeTime && expirationOption.relativeTimeUnit) {
      expirationTime = dayjs()
        .add(expirationOption.relativeTime, expirationOption.relativeTimeUnit)
        .unix()
        .toString()
    }

    let reservoirMarket = marketplaces[0]

    const listing: Listings[0] = {
      token: `${contract}:${tokenId}`,
      // weiPrice: parseUnits(`${+reservoirMarket.price}`, currency?.decimals)
      weiPrice: parseUnits(`${300}`, currency?.decimals)
        .mul(quantity)
        .toString(),
      //@ts-ignore
      orderbook: reservoirMarket.orderbook,
      //@ts-ignore
      orderKind: reservoirMarket.orderKind,
    }

    // if (
    //   enableOnChainRoyalties &&
    //   onChainRoyalties &&
    //   listing.orderKind === 'seaport'
    // ) {
    //   const royalties = onChainRoyalties.recipients.map((recipient, i) => {
    //     const bps =
    //       (parseFloat(
    //         formatUnits(onChainRoyalties.amounts[i], currency.decimals)
    //       ) /
    //         1) *
    //       10000
    //     return `${recipient}:${bps}`
    //   })
    //   listing.automatedRoyalties = false
    //   listing.fees = [...royalties]
    //   if (
    //     client.marketplaceFee &&
    //     client.marketplaceFeeRecipient &&
    //     listing.orderbook === 'reservoir'
    //   ) {
    //     listing.fees.push(
    //       `${client.marketplaceFeeRecipient}:${client.marketplaceFee}`
    //     )
    //   }
    // }

    if (quantity > 1) {
      listing.quantity = quantity
    }

    if (expirationTime) {
      listing.expirationTime = expirationTime
    }

    if (currency && currency.contract != constants.AddressZero) {
      listing.currency = currency.contract
    }

    // Edit listing
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
        signer,
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
      })
  }, [
    client,
    marketplaces,
    signer,
    collectionId,
    tokenId,
    expirationOption,
    currency,
    quantity,
    // enableOnChainRoyalties,
    // onChainRoyalties,
  ])

  const cancelOrder = useCallback(() => {
    if (!signer) {
      const error = new Error('Missing a signer')
      setTransactionError(error)
      throw error
    }

    if (!listingId) {
      const error = new Error('Missing list id to cancel')
      setTransactionError(error)
      throw error
    }

    if (!client) {
      const error = new Error('ReservoirClient was not initialized')
      setTransactionError(error)
      throw error
    }

    setEditListingStep(EditListingStep.Approving)

    client.actions
      .cancelOrder({
        id: listingId,
        signer,
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
        const message = 'Oops, something went wrong. Please try again.'
        //@ts-ignore: Should be fixed in an update to typescript
        const transactionError = new Error(message, {
          cause: error,
        })
        setTransactionError(transactionError)
        setEditListingStep(EditListingStep.Edit)
        setStepData(null)
        setSteps(null)
      })
  }, [listingId, client, signer])

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
        loading: isFetchingPage !== undefined ? isFetchingPage : true,
        listing,
        tokenId,
        contract,
        token,
        quantityAvailable,
        collection,
        quantity,
        setQuantity,
        editListingStep,
        transactionError,
        usdPrice,
        totalUsd,
        blockExplorerBaseUrl,
        steps,
        stepData,
        setEditListingStep,
        editListing,
      })}
    </>
  )
}
