import React, {
  FC,
  useState,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
} from 'react'
import {
  useTokens,
  useCoinConversion,
  useReservoirClient,
  useMarketplaces,
  useListingPreapprovalCheck,
  useCollections,
  useUserTokens,
  useChainCurrency,
  useOnChainRoyalties,
} from '../../hooks'
import { useAccount, useWalletClient } from 'wagmi'

import { Execute, ReservoirClientActions } from '@reservoir0x/reservoir-sdk'
import dayjs from 'dayjs'
import { Marketplace } from '../../hooks/useMarketplaces'
import { ExpirationOption } from '../../types/ExpirationOption'
import expirationOptions from '../../lib/defaultExpirationOptions'
import { Currency } from '../../types/Currency'
import { formatUnits, parseUnits, zeroAddress } from 'viem'

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

export type ListModalStepData = {
  totalSteps: number
  stepProgress: number
  currentStep: Execute['steps'][0]
  listingData: ListingData[]
}

type ChildrenProps = {
  token?: NonNullable<NonNullable<ReturnType<typeof useTokens>>['data']>[0]
  quantityAvailable: number
  collection?: NonNullable<ReturnType<typeof useCollections>['data']>[0]
  listStep: ListStep
  usdPrice: number
  expirationOptions: ExpirationOption[]
  expirationOption: ExpirationOption
  marketplaces: Marketplace[]
  unapprovedMarketplaces: Marketplace[]
  isFetchingUnapprovedMarketplaces: boolean
  isFetchingOnChainRoyalties: boolean
  localMarketplace: Marketplace | null
  listingData: ListingData[]
  transactionError?: Error | null
  stepData: ListModalStepData | null
  currencies: Currency[]
  currency: Currency
  quantity: number
  royaltyBps?: number
  setListStep: React.Dispatch<React.SetStateAction<ListStep>>
  toggleMarketplace: (marketplace: Marketplace) => void
  setExpirationOption: React.Dispatch<React.SetStateAction<ExpirationOption>>
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
  enableOnChainRoyalties: boolean
  oracleEnabled: boolean
  feesBps?: string[]
  children: (props: ChildrenProps) => ReactNode
}

const isCurrencyAllowed = (currency: Currency, marketplace: Marketplace) => {
  if (marketplace.listingEnabled) {
    if (currency.contract === zeroAddress) {
      return true
    }
    switch (marketplace.orderbook) {
      case 'reservoir':
        return true

      case 'opensea': {
        return (
          marketplace.paymentTokens?.find(
            (token) => token.address === currency.contract
          ) !== undefined
        )
      }
    }
  }
  return false
}

export const ListModalRenderer: FC<Props> = ({
  open,
  tokenId,
  collectionId,
  currencies,
  normalizeRoyalties,
  enableOnChainRoyalties = false,
  oracleEnabled = false,
  feesBps,
  children,
}) => {
  const { data: wallet } = useWalletClient()
  const account = useAccount()
  const client = useReservoirClient()
  const [listStep, setListStep] = useState<ListStep>(ListStep.SelectMarkets)
  const [listingData, setListingData] = useState<ListingData[]>([])
  const [allMarketplaces] = useMarketplaces(collectionId, true, feesBps)
  const [loadedInitalPrice, setLoadedInitalPrice] = useState(false)
  const [transactionError, setTransactionError] = useState<Error | null>()
  const [stepData, setStepData] = useState<ListModalStepData | null>(null)
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
  const { data: collections } = useCollections(
    open && {
      id: collectionId,
      normalizeRoyalties,
    }
  )
  const collection = collections && collections[0] ? collections[0] : undefined

  const [expirationOption, setExpirationOption] = useState<ExpirationOption>(
    expirationOptions[5]
  )

  const { data: onChainRoyalties, isFetching: isFetchingOnChainRoyalties } =
    useOnChainRoyalties({
      contract,
      tokenId,
      chainId: chainCurrency.chainId,
      enabled: enableOnChainRoyalties && open,
    })

  let royaltyBps = collection?.royalties?.bps

  const onChainRoyaltyBps = useMemo(() => {
    const totalRoyalty = onChainRoyalties?.[1].reduce((total, royalty) => {
      total += parseFloat(formatUnits(royalty, currency.decimals || 18))
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

  const [marketplaces, setMarketplaces] = useMarketplaces(
    collectionId,
    true,
    feesBps,
    royaltyBps
  )
  const {
    data: unapprovedMarketplaces,
    isFetching: isFetchingUnapprovedMarketplaces,
  } = useListingPreapprovalCheck(
    marketplaces,
    open ? tokenId : undefined,
    open ? contract : undefined
  )

  const { data: tokens } = useTokens(
    open && {
      tokens: [`${contract}:${tokenId}`],
      includeAttributes: true,
      includeLastSale: true,
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

  const coinConversion = useCoinConversion(
    open ? 'USD' : undefined,
    currency.symbol,
    currency.coinGeckoId
  )
  const usdPrice = coinConversion.length > 0 ? coinConversion[0].price : 0

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
  }

  useEffect(() => {
    if (
      open &&
      token &&
      collection &&
      !loadedInitalPrice &&
      allMarketplaces.length > 0
    ) {
      let updatedMarketplaces = allMarketplaces.map(
        (marketplace): Marketplace => {
          const listingEnabled = isCurrencyAllowed(currency, marketplace)
          return {
            ...marketplace,
            price: '',
            truePrice: '',
            listingEnabled,
            isSelected: listingEnabled ? marketplace.isSelected : false,
          }
        }
      )
      setMarketplaces(updatedMarketplaces)
      setLoadedInitalPrice(true)
    }
  }, [token, collection, loadedInitalPrice, open, marketplaces.length])

  useEffect(() => {
    if (open && loadedInitalPrice) {
      let updatedMarketplaces = allMarketplaces.map(
        (marketplace): Marketplace => {
          const listingEnabled = isCurrencyAllowed(currency, marketplace)
          return {
            ...marketplace,
            listingEnabled,
            isSelected: listingEnabled ? marketplace.isSelected : false,
          }
        }
      )
      setMarketplaces(updatedMarketplaces)
    }
  }, [open, currency])

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
          token: `${contract}:${tokenId}`,
          weiPrice: (
            parseUnits(`${+market.price}`, currency.decimals || 18) *
            BigInt(quantity)
          ).toString(),
          //@ts-ignore
          orderbook: market.orderbook,
          //@ts-ignore
          orderKind: market.orderKind,
        }

        if (
          enableOnChainRoyalties &&
          onChainRoyalties &&
          listing.orderKind?.includes('seaport')
        ) {
          const royalties = onChainRoyalties[0].map((recipient, i) => {
            const bps =
              (parseFloat(
                formatUnits(onChainRoyalties[1][i], currency.decimals || 18)
              ) /
                1) *
              10000
            return `${recipient}:${bps}`
          })
          listing.automatedRoyalties = false
          listing.fees = [...royalties]
        }

        if (listing.orderbook === 'reservoir') {
          const fees = feesBps || client.marketplaceFees
          if (fees) {
            if (!listing.fees) {
              listing.fees = []
            }
            listing.fees = listing.fees.concat(fees)
          }
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

        if (oracleEnabled) {
          listing.options = {
            [`${listing.orderKind}`]: {
              useOffChainCancellation: true,
            },
          }
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
        wallet,
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
            const listings =
              currentStepItem && currentStepItem.orderIndexes !== undefined
                ? listingData.filter((_, i) =>
                    currentStepItem.orderIndexes?.includes(i)
                  )
                : [listingData[listingData.length - 1]]
            setStepData({
              totalSteps: stepCount,
              stepProgress: stepCount,
              currentStep,
              listingData: listings,
            })
          } else {
            const currentStep = executableSteps[incompleteStepIndex]
            const listingIndexes: Set<number> = new Set()
            currentStep.items?.forEach(({ orderIndexes, status }) => {
              if (status === 'incomplete') {
                orderIndexes?.forEach((orderIndex) => {
                  listingIndexes.add(orderIndex)
                })
              }
            })
            const listings = Array.from(listingIndexes).map(
              (index) => listingData[index]
            )

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
        //@ts-ignore
        const transactionError = new Error(error?.message || '', {
          cause: error,
        })
        setTransactionError(transactionError)
      })
  }, [
    client,
    marketplaces,
    wallet,
    collectionId,
    tokenId,
    expirationOption,
    currency,
    quantity,
    enableOnChainRoyalties,
    onChainRoyalties,
    feesBps,
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
        isFetchingOnChainRoyalties,
        localMarketplace,
        listingData,
        transactionError,
        stepData,
        currencies: currencies || [defaultCurrency],
        currency,
        quantity,
        royaltyBps,
        setListStep,
        toggleMarketplace,
        setMarketPrice,
        setCurrency,
        setExpirationOption,
        setQuantity,
        listToken,
      })}
    </>
  )
}

ListModalRenderer.displayName = 'ListModalRenderer'
