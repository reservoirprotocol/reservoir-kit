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
  useTokenOpensea,
  useUserTokens,
  useChainCurrency,
} from '../../hooks'
import { useAccount, useSigner } from 'wagmi'

import {
  Execute,
  ReservoirClientActions,
} from '@reservoir0x/reservoir-kit-client'
import debounce from '../../lib/debounce'
import { parseUnits } from 'ethers/lib/utils'
import dayjs from 'dayjs'
import { Marketplace } from '../../hooks/useMarketplaces'
import { ExpirationOption } from '../../types/ExpirationOption'
import expirationOptions from '../../lib/defaultExpirationOptions'
import { constants } from 'ethers'
import { Currency } from '../../types/Currency'

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
  quantityAvailable: number
  collection?: NonNullable<ReturnType<typeof useCollections>['data']>[0]
  listStep: ListStep
  usdPrice: ReturnType<typeof useCoinConversion>
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
  currencies: Currency[]
  currency: Currency
  quantity: number
  setListStep: React.Dispatch<React.SetStateAction<ListStep>>
  toggleMarketplace: (marketplace: Marketplace) => void
  setExpirationOption: React.Dispatch<React.SetStateAction<ExpirationOption>>
  setSyncProfit: React.Dispatch<React.SetStateAction<boolean>>
  setMarketPrice: (price: number, market: Marketplace) => void
  setCurrency: (currency: Currency) => void
  setQuantity: React.Dispatch<React.SetStateAction<number>>
  listToken: () => void
}

type Props = {
  open: boolean
  tokenId?: string
  collectionId?: string
  currencies?: Currency[]
  normalizeRoyalties?: boolean
  children: (props: ChildrenProps) => ReactNode
}

type PaymentTokens = NonNullable<
  NonNullable<ReturnType<typeof useTokenOpensea>['response']>['collection']
>['payment_tokens']

const isCurrencyAllowed = (
  currency: Currency,
  marketplace: Marketplace,
  openseaPaymentTokens: PaymentTokens
) => {
  if (marketplace.listingEnabled) {
    if (currency.contract === constants.AddressZero) {
      return true
    }
    switch (marketplace.orderbook) {
      case 'reservoir':
        return true
      case 'opensea':
        return openseaPaymentTokens.some(
          (token) => token.address === currency.contract
        )
    }
  }
  return false
}

const startingPrice = (
  currency: Currency,
  token: ReturnType<typeof useTokens>['data'][0],
  collection?: NonNullable<ReturnType<typeof useCollections>['data']>['0']
) => {
  let startingPrice: number | string = ''
  if (currency.contract === constants.AddressZero) {
    startingPrice =
      Math.max(
        ...(token?.token?.attributes?.map((attr: any) =>
          Number(attr?.floorAskPrice || 0)
        ) || []),
        0
      ) ||
      collection?.floorAsk?.price?.amount?.native ||
      0
  }
  return startingPrice
}

export const ListModalRenderer: FC<Props> = ({
  open,
  tokenId,
  collectionId,
  currencies,
  normalizeRoyalties,
  children,
}) => {
  const { data: signer } = useSigner()
  const account = useAccount()
  const client = useReservoirClient()
  const [listStep, setListStep] = useState<ListStep>(ListStep.SelectMarkets)
  const [listingData, setListingData] = useState<ListingData[]>([])
  const [allMarketplaces] = useMarketplaces(true)
  const [marketplaces, setMarketplaces] = useMarketplaces(true)
  const [loadedInitalPrice, setLoadedInitalPrice] = useState(false)
  const [syncProfit, setSyncProfit] = useState(true)
  const [transactionError, setTransactionError] = useState<Error | null>()
  const [stepData, setStepData] = useState<StepData | null>(null)
  const [localMarketplace, setLocalMarketplace] = useState<Marketplace | null>(
    null
  )
  const chainCurrency = useChainCurrency()
  const defaultCurrency = {
    contract: chainCurrency.address,
    symbol: chainCurrency.symbol,
  }
  const [currency, setCurrency] = useState<Currency>(
    currencies && currencies[0] ? currencies[0] : defaultCurrency
  )
  const [quantity, setQuantity] = useState(1)
  const contract = collectionId ? collectionId?.split(':')[0] : undefined
  const {
    data: unapprovedMarketplaces,
    isFetching: isFetchingUnapprovedMarketplaces,
  } = useListingPreapprovalCheck(
    marketplaces,
    open ? tokenId : undefined,
    open ? contract : undefined
  )

  const [expirationOption, setExpirationOption] = useState<ExpirationOption>(
    expirationOptions[5]
  )

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
  const { data: collections } = useCollections(
    open && {
      id: collectionId,
      normalizeRoyalties,
    }
  )

  const { response: openSeaToken } = useTokenOpensea(
    open ? contract : undefined,
    open ? tokenId : undefined
  )

  const paymentTokens = openSeaToken?.collection?.payment_tokens

  const collection = collections && collections[0] ? collections[0] : undefined

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

  const usdPrice = useCoinConversion(open ? 'USD' : undefined, currency.symbol)

  const toggleMarketplace = (marketplace: Marketplace) => {
    const updatedMarketplaces = marketplaces.map((market) => {
      if (market.name == marketplace.name) {
        return {
          ...market,
          isSelected: !market.isSelected,
        }
      } else {
        return market
      }
    })
    const hasNonNativeMarketplace = updatedMarketplaces.find(
      (marketplace) =>
        marketplace.isSelected && marketplace.orderbook !== 'reservoir'
    )
    if (hasNonNativeMarketplace) {
      setQuantity(1)
    }
    setMarketplaces(updatedMarketplaces)
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
      allMarketplaces.length > 0
    ) {
      const price = startingPrice(currency, token, collection)
      let updatedMarketplaces = allMarketplaces.map(
        (marketplace): Marketplace => {
          const listingEnabled = isCurrencyAllowed(
            currency,
            marketplace,
            paymentTokens || [chainCurrency]
          )
          return {
            ...marketplace,
            price: price,
            truePrice: price,
            listingEnabled,
            isSelected: listingEnabled ? marketplace.isSelected : false,
          }
        }
      )
      if (price !== '') {
        updatedMarketplaces = syncMarketPrices(
          updatedMarketplaces[0],
          updatedMarketplaces
        )
      }
      setMarketplaces(updatedMarketplaces)
      setLoadedInitalPrice(true)
    }
  }, [token, collection, loadedInitalPrice, open, marketplaces.length])

  useEffect(() => {
    if (open && syncProfit && loadedInitalPrice && localMarketplace) {
      setMarketplaces(syncMarketPrices(localMarketplace, marketplaces))
    }
  }, [open, syncProfit])

  useEffect(() => {
    if (open && loadedInitalPrice) {
      const price = startingPrice(currency, token, collection)
      let updatedMarketplaces = allMarketplaces.map(
        (marketplace): Marketplace => {
          const listingEnabled = isCurrencyAllowed(
            currency,
            marketplace,
            paymentTokens || [chainCurrency]
          )
          return {
            ...marketplace,
            price: price,
            truePrice: price,
            listingEnabled,
            isSelected: listingEnabled ? marketplace.isSelected : false,
          }
        }
      )
      if (price !== '') {
        updatedMarketplaces = syncMarketPrices(
          updatedMarketplaces[0],
          updatedMarketplaces
        )
      }
      setMarketplaces(updatedMarketplaces)
    }
  }, [open, currency, paymentTokens])

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
      setExpirationOption(expirationOptions[5])
      setSyncProfit(true)
      setQuantity(1)
    }
    setCurrency(currencies && currencies[0] ? currencies[0] : defaultCurrency)
  }, [open])

  useEffect(() => {
    if (currencies && currencies.length > 5) {
      console.warn(
        'The ListModal UI was designed to have a maximum of 5 currencies, going above 5 may degrade the user experience.'
      )
    }
  }, [currencies])

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

    const contract = collectionId ? collectionId?.split(':')[0] : undefined

    marketplaces.forEach((market) => {
      if (market.isSelected) {
        const listing: Listings[0] = {
          token: `${contract}:${tokenId}`,
          weiPrice: parseUnits(`${market.price}`, currency.decimals).toString(),
          //@ts-ignore
          orderbook: market.orderbook,
          //@ts-ignore
          orderKind: market.orderKind,
        }

        if (quantity > 1) {
          listing.quantity = quantity
        }

        if (expirationTime) {
          listing.expirationTime = expirationTime
        }

        if (currency && currency.contract != constants.AddressZero) {
          listing.currency = currency.contract
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
  }, [
    client,
    marketplaces,
    signer,
    collectionId,
    tokenId,
    expirationOption,
    currency,
    quantity,
  ])

  return (
    <>
      {children({
        token,
        quantityAvailable,
        collection,
        listStep,
        usdPrice,
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
        currencies: currencies || [defaultCurrency],
        currency,
        quantity,
        setListStep,
        toggleMarketplace,
        setMarketPrice,
        setCurrency,
        setSyncProfit,
        setExpirationOption,
        setQuantity,
        listToken,
      })}
    </>
  )
}

ListModalRenderer.displayName = 'ListModalRenderer'
