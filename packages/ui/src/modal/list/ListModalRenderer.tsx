import React, {
  FC,
  useState,
  useMemo,
  ReactNode,
  useCallback,
  useEffect,
} from 'react'
import {
  useTokens,
  useCoinConversion,
  useReservoirClient,
  useMarketplaces,
  useListingPreapprovalCheck,
  useCollections,
} from '../../hooks'
import { useSigner } from 'wagmi'

import {
  Execute,
  ReservoirClientActions,
} from '@reservoir0x/reservoir-kit-client'
import debounce from '../../lib/debounce'
import { parseEther } from 'ethers/lib/utils'
import dayjs from 'dayjs'
import { Marketplace } from '../../hooks/useMarketplaces'
import { ExpirationOption } from '../../types/ExpirationOption'
import expirationOptions from '../../lib/defaultExpirationOptions'

export enum ListStep {
  SelectMarkets,
  SetPrice,
  ListItem,
  Complete,
}

export type Listings = Parameters<
  ReservoirClientActions['listToken']
>['0']['listings']

export type ListingData = {
  listing: Listings[0]
  marketplace: Marketplace
}

export type StepData = {
  totalSteps: number
  stepProgress: number
  currentStep: Execute['steps'][0]
  listingData: ListingData
}

type ChildrenProps = {
  token?: NonNullable<NonNullable<ReturnType<typeof useTokens>>['data']>[0]
  collection?: NonNullable<ReturnType<typeof useCollections>['data']>[0]
  listStep: ListStep
  ethUsdPrice: ReturnType<typeof useCoinConversion>
  expirationOptions: ExpirationOption[]
  expirationOption: ExpirationOption
  marketplaces: Marketplace[]
  unapprovedMarketplaces: Marketplace[]
  isFetchingUnapprovedMarketplaces: boolean
  localMarketplace: Marketplace | null
  syncProfit: boolean
  listingData: ListingData[]
  transactionError?: Error | null
  stepData: StepData | null
  setListStep: React.Dispatch<React.SetStateAction<ListStep>>
  toggleMarketplace: (marketplace: Marketplace) => void
  setExpirationOption: React.Dispatch<React.SetStateAction<ExpirationOption>>
  setSyncProfit: React.Dispatch<React.SetStateAction<boolean>>
  setMarketPrice: (price: number, market: Marketplace) => void
  listToken: () => void
}

type Props = {
  open: boolean
  tokenId?: string
  collectionId?: string
  children: (props: ChildrenProps) => ReactNode
}

export const ListModalRenderer: FC<Props> = ({
  open,
  tokenId,
  collectionId,
  children,
}) => {
  const { data: signer } = useSigner()
  const client = useReservoirClient()
  const [listStep, setListStep] = useState<ListStep>(ListStep.SelectMarkets)
  const [listingData, setListingData] = useState<ListingData[]>([])
  const [marketplaces, setMarketplaces] = useMarketplaces(true)
  const [loadedInitalPrice, setLoadedInitalPrice] = useState(false)
  const [syncProfit, setSyncProfit] = useState(true)
  const [transactionError, setTransactionError] = useState<Error | null>()
  const [stepData, setStepData] = useState<StepData | null>(null)
  const [localMarketplace, setLocalMarketplace] = useState<Marketplace | null>(
    null
  )
  const {
    data: unapprovedMarketplaces,
    isFetching: isFetchingUnapprovedMarketplaces,
  } = useListingPreapprovalCheck(
    marketplaces,
    open ? tokenId : undefined,
    open ? collectionId : undefined
  )

  const [expirationOption, setExpirationOption] = useState<ExpirationOption>(
    expirationOptions[0]
  )

  const { data: tokens } = useTokens(
    open && {
      tokens: [`${collectionId}:${tokenId}`],
      includeAttributes: true,
    }
  )
  const { data: collections } = useCollections(
    open && {
      id: collectionId,
    }
  )

  const collection = collections && collections[0] ? collections[0] : undefined

  const token = tokens && tokens.length > 0 ? tokens[0] : undefined

  const ethUsdPrice = useCoinConversion(open ? 'USD' : undefined)

  const toggleMarketplace = (marketplace: Marketplace) => {
    setMarketplaces(
      marketplaces.map((market) => {
        if (market.name == marketplace.name) {
          return {
            ...market,
            isSelected: !market.isSelected,
          }
        } else {
          return market
        }
      })
    )
  }

  const syncMarketPrices = (
    updatingMarket: Marketplace,
    marketplaces: Marketplace[]
  ) => {
    let syncedMarketplaces = marketplaces.slice()
    if (syncProfit) {
      let profit =
        (1 - (updatingMarket.fee?.percent || 0) / 100) *
        Number(updatingMarket.price)

      syncedMarketplaces = syncedMarketplaces.map((marketplace) => {
        let truePrice = profit / (1 - (marketplace?.fee?.percent || 0) / 100)

        return {
          ...marketplace,
          price: Math.round(truePrice * 10000) / 10000,
          truePrice: truePrice,
        }
      })
    }
    return syncedMarketplaces
  }

  const setMarketPrice = (price: number | string, market: Marketplace) => {
    let updatedMarketplaces = marketplaces.map((marketplace) => {
      if (marketplace.name == market.name) {
        return {
          ...marketplace,
          price: price,
          truePrice: price,
        }
      }
      return marketplace
    })
    setMarketplaces(updatedMarketplaces)
    if (price !== '') {
      const updatedMarketplace = updatedMarketplaces.find(
        (marketplace) => market.name == marketplace.name
      )
      debouncedUpdateMarkets(updatedMarketplace, updatedMarketplaces)
    }
  }

  let debouncedUpdateMarkets = useMemo(
    () =>
      debounce(
        (
          updatedMarketplace: Marketplace,
          updatedMarketplaces: Marketplace[]
        ) => {
          setMarketplaces(
            syncMarketPrices(updatedMarketplace, updatedMarketplaces)
          )
        },
        800
      ),
    [syncProfit]
  )

  useEffect(() => {
    if (
      open &&
      token &&
      collection &&
      !loadedInitalPrice &&
      marketplaces.length > 0
    ) {
      let startingPrice: number =
        Math.max(
          ...(token?.token?.attributes?.map((attr: any) =>
            Number(attr?.floorAskPrice || 0)
          ) || []),
          0
        ) ||
        collection?.floorAsk?.price?.amount?.native ||
        0

      setLoadedInitalPrice(true)
      let updatedMarketplaces = marketplaces.map((marketplace): Marketplace => {
        return {
          ...marketplace,
          price: startingPrice,
          truePrice: startingPrice,
        }
      })
      updatedMarketplaces = syncMarketPrices(
        updatedMarketplaces[0],
        updatedMarketplaces
      )
      setMarketplaces(updatedMarketplaces)
    }
  }, [token, collection, loadedInitalPrice, open, marketplaces.length])

  useEffect(() => {
    if (open && syncProfit && loadedInitalPrice && localMarketplace) {
      setMarketplaces(syncMarketPrices(localMarketplace, marketplaces))
    }
  }, [open, syncProfit])

  useEffect(() => {
    if (marketplaces) {
      setLocalMarketplace(
        marketplaces.find(
          (marketplace) => marketplace.orderbook === 'reservoir'
        ) || null
      )
    } else {
      setLocalMarketplace(null)
    }
  }, [marketplaces])

  useEffect(() => {
    if (!open) {
      setListStep(ListStep.SelectMarkets)
      setTransactionError(null)
      if (marketplaces.length > 0) {
        setMarketplaces(
          marketplaces.map((marketplace) => {
            return {
              ...marketplace,
              isSelected: marketplace.orderbook === 'reservoir',
            }
          })
        )
      }
      setLoadedInitalPrice(false)
      setStepData(null)
      setExpirationOption(expirationOptions[0])
      setSyncProfit(true)
    }
  }, [open])

  const listToken = useCallback(() => {
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

    setTransactionError(null)

    const listingData: ListingData[] = []
    let expirationTime: string | null = null

    if (expirationOption.relativeTime && expirationOption.relativeTimeUnit) {
      expirationTime = dayjs()
        .add(expirationOption.relativeTime, expirationOption.relativeTimeUnit)
        .unix()
        .toString()
    }

    marketplaces.forEach((market) => {
      if (market.isSelected) {
        const listing: Listings[0] = {
          token: `${collectionId}:${tokenId}`,
          weiPrice: parseEther(`${market.price}`).toString(),
          //@ts-ignore
          orderbook: market.orderbook,
          //@ts-ignore
          orderKind: market.orderKind,
        }

        if (expirationTime) {
          listing.expirationTime = expirationTime
        }

        listingData.push({
          listing,
          marketplace: market,
        })
      }
    })

    setListingData(listingData)
    setListStep(ListStep.ListItem)

    client.actions
      .listToken({
        listings: listingData.map((data) => data.listing),
        signer,
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

          if (
            incompleteStepIndex === null ||
            incompleteStepItemIndex === null
          ) {
            const currentStep = executableSteps[executableSteps.length - 1]
            const currentStepItem = currentStep.items
              ? currentStep.items[currentStep.items.length]
              : null
            setListStep(ListStep.Complete)
            setStepData({
              totalSteps: stepCount,
              stepProgress: stepCount,
              currentStep,
              listingData:
                currentStepItem && currentStepItem.orderIndex !== undefined
                  ? listingData[currentStepItem.orderIndex]
                  : listingData[listingData.length - 1],
            })
          } else {
            const currentStep = executableSteps[incompleteStepIndex]
            const currentStepItem = currentStep.items
              ? currentStep.items[incompleteStepItemIndex]
              : null
            const listings =
              currentStepItem?.orderIndex !== undefined
                ? listingData[currentStepItem.orderIndex]
                : listingData[listingData.length - 1]
            setStepData({
              totalSteps: stepCount,
              stepProgress: incompleteStepIndex,
              currentStep: executableSteps[incompleteStepIndex],
              listingData: listings,
            })
          }
        },
      })
      .catch((e: any) => {
        const error = e as Error
        const transactionError = new Error(error?.message || '', {
          cause: error,
        })
        setTransactionError(transactionError)
        console.log(error)
      })
  }, [client, marketplaces, signer, collectionId, tokenId, expirationOption])

  return (
    <>
      {children({
        token,
        collection,
        listStep,
        ethUsdPrice,
        expirationOption,
        expirationOptions,
        marketplaces,
        unapprovedMarketplaces,
        isFetchingUnapprovedMarketplaces,
        localMarketplace,
        syncProfit,
        listingData,
        transactionError,
        stepData,
        setListStep,
        toggleMarketplace,
        setMarketPrice,
        setSyncProfit,
        listToken,
        setExpirationOption,
      })}
    </>
  )
}
