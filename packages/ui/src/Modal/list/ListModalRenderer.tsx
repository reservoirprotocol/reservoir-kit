import React, {
  FC,
  useState,
  useMemo,
  ReactNode,
  useCallback,
  useEffect,
} from 'react'
import {
  useCollection,
  useTokenDetails,
  useEthConversion,
  useReservoirClient,
} from '../../hooks'
import { useSigner } from 'wagmi'

import { BigNumber } from 'ethers'
import {
  Execute,
  ReservoirClientActions,
} from '@reservoir0x/reservoir-kit-client'
import initialMarkets from './initialMarkets'
import debounce from '../../lib/debounce'
import { parseEther } from 'ethers/lib/utils'
import dayjs, { ManipulateType } from 'dayjs'

export enum ListStep {
  SelectMarkets,
  SetPrice,
  ListItem,
  Complete,
}

export type Market = {
  name: string
  imgURL: string
  isSelected: boolean
  isNative: boolean
  fee: number
  price: number
  truePrice: number
  orderBook: string
  orderKind: string
}

type ExpirationOption = {
  text: string
  value: string
  relativeTime: number | null
  relativeTimeUnit: ManipulateType | null
}

export type Listings = Parameters<
  ReservoirClientActions['listToken']
>['0']['listings']

export type ListingData = {
  listing: Listings[0]
  marketplace: Market
}

export type StepData = {
  totalSteps: number
  stepProgress: number
  currentStep: Execute['steps'][0]
  listingData: ListingData
}

type ChildrenProps = {
  token:
    | false
    | NonNullable<
        NonNullable<ReturnType<typeof useTokenDetails>>['tokens']
      >['0']
  collection: ReturnType<typeof useCollection>
  listStep: ListStep
  ethUsdPrice: ReturnType<typeof useEthConversion>
  balance?: BigNumber
  address?: string
  expirationOptions: ExpirationOption[]
  expirationOption: ExpirationOption
  markets: Market[]
  syncProfit: boolean
  listingData: ListingData[]
  transactionError?: Error | null
  stepData: StepData | null
  setListStep: React.Dispatch<React.SetStateAction<ListStep>>
  toggleMarketplace: (marketplace: Market) => void
  setExpirationOption: React.Dispatch<React.SetStateAction<ExpirationOption>>
  setSyncProfit: React.Dispatch<React.SetStateAction<boolean>>
  setMarketPrice: (price: number, market: Market) => void
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
  const [markets, setMarkets] = useState(initialMarkets)
  const [syncProfit, setSyncProfit] = useState(true)
  const [loadedInitalPrice, setLoadedInitalPrice] = useState(false)
  const [transactionError, setTransactionError] = useState<Error | null>()
  const [stepData, setStepData] = useState<StepData | null>(null)

  const expirationOptions: ExpirationOption[] = [
    {
      text: '1 Hour',
      value: 'hour',
      relativeTime: 1,
      relativeTimeUnit: 'h',
    },
    {
      text: '12 Hours',
      value: '12 hours',
      relativeTime: 12,
      relativeTimeUnit: 'h',
    },
    {
      text: '1 Day',
      value: '1 day',
      relativeTime: 1,
      relativeTimeUnit: 'd',
    },
    {
      text: '3 Day',
      value: '3 days',
      relativeTime: 3,
      relativeTimeUnit: 'd',
    },
    { text: '1 Week', value: 'week', relativeTime: 1, relativeTimeUnit: 'w' },
    { text: '1 Month', value: 'month', relativeTime: 1, relativeTimeUnit: 'M' },
    {
      text: '3 Months',
      value: '3 months',
      relativeTime: 3,
      relativeTimeUnit: 'M',
    },
    {
      text: 'None',
      value: 'never',
      relativeTime: null,
      relativeTimeUnit: null,
    },
  ]

  const [expirationOption, setExpirationOption] = useState<ExpirationOption>(
    expirationOptions[0]
  )

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

  const toggleMarketplace = (marketplace: Market) => {
    setMarkets(
      markets.map((market) => {
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

  const syncMarketPrices = (market: any) => {
    if (syncProfit) {
      let updatingMarket = markets.find((m) => m.name == market.name)
      let profit =
        (1 - (updatingMarket?.fee || 0)) * Number(updatingMarket?.price || 0)

      setMarkets(
        markets.map((m) => {
          let truePrice = profit / (1 - m.fee)
          m.price = Math.round((profit / (1 - m.fee)) * 1000) / 1000
          m.truePrice = truePrice
          return m
        })
      )
    }
  }

  const setMarketPrice = (price: any, market: any) => {
    setMarkets(
      markets.map((m) => {
        if (m.name == market.name) {
          m.price = price
          m.truePrice = price
        }
        return m
      })
    )
    debouncedUpdateMarkets(market)
  }

  let debouncedUpdateMarkets = useMemo(
    () => debounce(syncMarketPrices, 1200),
    [syncProfit, markets]
  )

  useEffect(() => {
    if (token && collection && !loadedInitalPrice) {
      let startingPrice: number =
        Math.max(
          ...(token?.token?.attributes?.map((attr: any) =>
            Number(attr?.floorAskPrice || 0)
          ) || []),
          0
        ) ||
        collection?.floorAsk?.price ||
        0

      setLoadedInitalPrice(true)
      setMarkets(
        markets.map((market) => {
          market.price = startingPrice
          market.truePrice = startingPrice
          return market
        })
      )

      syncMarketPrices(markets[0])
    }
  }, [token, collection])

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

    markets.forEach((market) => {
      if (market.isSelected) {
        const listing: Listings[0] = {
          token: `${collectionId}:${tokenId}`,
          weiPrice: parseEther(`${market.truePrice.toFixed(18)}`).toString(),
          //@ts-ignore
          orderbook: market.orderBook,
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
          debugger
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
  }, [client, markets, signer, collectionId, tokenId, expirationOption])

  return (
    <>
      {children({
        token,
        collection,
        listStep,
        ethUsdPrice,
        expirationOption,
        expirationOptions,
        markets,
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
