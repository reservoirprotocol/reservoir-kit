import {
  Execute,
  LogLevel,
  ReservoirChain,
  ReservoirClientActions,
  ReservoirWallet,
  paths,
  setParams,
} from '@reservoir0x/reservoir-sdk'
import {
  useCurrencyConversion,
  useListings,
  usePaymentTokens,
  useReservoirClient,
  useTokens,
  useChainCurrency,
} from '../hooks'
import { defaultFetcher } from '../lib/swr'
import React, {
  createContext,
  useCallback,
  useRef,
  ReactNode,
  useEffect,
  FC,
  useState,
  useContext,
} from 'react'
import { useAccount, useSwitchNetwork } from 'wagmi'
import {
  Address,
  WalletClient,
  formatUnits,
  parseUnits,
  zeroAddress,
} from 'viem'
import { version } from '../../package.json'
import { getNetwork, getWalletClient } from 'wagmi/actions'
import { EnhancedCurrency } from '../hooks/usePaymentTokens'
import { ProviderOptionsContext } from '../ReservoirKitProvider'

type Order = NonNullable<ReturnType<typeof useListings>['data'][0]>
type OrdersSchema =
  paths['/orders/asks/v5']['get']['responses']['200']['schema']
type Token = NonNullable<ReturnType<typeof useTokens>['data'][0]>
type TokensSchema = paths['/tokens/v7']['get']['responses']['200']['schema']
type FloorAsk = NonNullable<NonNullable<Token['market']>['floorAsk']>
type CartItemPrice = FloorAsk['price']
type BuyTokenOptions = Parameters<
  ReservoirClientActions['buyToken']
>['0']['options']

export enum CheckoutStatus {
  Idle,
  Approving,
  Finalizing,
  Complete,
}

export enum CheckoutTransactionError {
  Unknown,
  PiceMismatch,
  InsufficientBalance,
  UserDenied,
  TransactionTimeOut,
}

type CartItem = {
  token: {
    id: string
    name: string
  }
  collection: {
    id: string
    name: string
  }
  order?: {
    id: string
    quantityRemaining: number
    quantity: number
    maker: string
  }
  price: CartItemPrice
  poolId?: string
  poolPrices?: CartItemPrice[]
  previousPrice?: CartItemPrice
}

export type Cart = {
  totalPrice: number
  totalPriceRaw: bigint
  currency?: EnhancedCurrency
  feeOnTop?: number
  feeOnTopRaw?: bigint
  feesOnTopBps?: string[]
  feesOnTopUsd?: string[]
  items: CartItem[]
  pools: Record<string, { prices: CartItemPrice[]; itemCount: number }>
  isValidating: boolean
  chain?: ReservoirChain
  pendingTransactionId?: string
  transaction: {
    id?: string
    txHashes?: {
      txHash: `0x${string}`
      chainId: number
    }[]
    chain: ReservoirChain
    items: CartItem[]
    error?: Error
    errorType?: CheckoutTransactionError
    status: CheckoutStatus
    steps?: Execute['steps']
    path?: Execute['path']
    currentStep?: Execute['steps'][0]
  } | null
}

const CartStorageKey = `reservoirkit.cart.${version}`

type CartStoreProps = {
  feesOnTopBps?: string[]
  feesOnTopUsd?: string[]
  persist?: boolean
  walletClient?: ReservoirWallet | WalletClient
}

function cartStore({
  feesOnTopBps,
  feesOnTopUsd,
  persist = true,
  walletClient,
}: CartStoreProps) {
  const providerOptionsContext = useContext(ProviderOptionsContext)
  const { address } = useAccount()
  const { switchNetworkAsync } = useSwitchNetwork()
  const [cartCurrency, setCartCurrency] = useState<Cart['currency']>()
  const [cartChain, setCartChain] = useState<Cart['chain']>()
  const cartData = useRef<Cart>({
    totalPrice: 0,
    totalPriceRaw: 0n,
    feesOnTopBps: undefined,
    feesOnTopUsd: undefined,
    items: [],
    pools: {},
    isValidating: false,
    transaction: null,
  })

  const subscribers = useRef(new Set<() => void>())
  const client = useReservoirClient()
  const { data: usdFeeConversion } = useCurrencyConversion(
    cartChain?.id,
    cartCurrency?.address,
    'usd'
  )
  const chainCurrency = useChainCurrency(cartChain?.id)

  const paymentTokens = usePaymentTokens(
    address !== undefined,
    address as Address,
    cartCurrency
      ? {
          symbol: cartCurrency.symbol as string,
          address: cartCurrency?.address as Address,
          name: cartCurrency?.name,
          decimals: cartCurrency.decimals as number,
          chainId: cartCurrency.chainId,
        }
      : chainCurrency,
    cartData.current.totalPriceRaw - (cartData.current.feeOnTopRaw ?? 0n),
    cartChain?.id,
    false,
    true,
    cartData.current?.items?.[0]?.price?.currency
      ? {
          ...cartData.current?.items[0].price.currency,
          address: cartData.current.items[0].price.currency.contract as Address,
          decimals: cartData.current.items[0].price.currency.decimals || 18,
          symbol: cartData.current.items[0].price.currency.symbol as string,
          chainId: cartChain?.id || 1,
        }
      : undefined
  )
  const usdPrice = Number(usdFeeConversion?.usd || 0)

  useEffect(() => {
    subscribe(() => {
      setCartCurrency(cartData.current.currency)
      setCartChain(cartData.current.chain)
    })

    if (persist && typeof window !== 'undefined' && window.localStorage) {
      const storedCart = window.localStorage.getItem(CartStorageKey)
      if (storedCart) {
        const rehydratedCart: Cart = JSON.parse(storedCart)
        const deserializedCurrency = rehydratedCart.currency
          ? {
              ...rehydratedCart.currency,
              usdPriceRaw: BigInt(rehydratedCart.currency.usdPriceRaw ?? 0n),
              currencyTotalRaw: BigInt(
                rehydratedCart.currency.currencyTotalRaw ?? 0n
              ),
              usdTotalPriceRaw: BigInt(
                rehydratedCart.currency.usdTotalPriceRaw ?? 0n
              ),
              balance: BigInt(rehydratedCart.currency.balance ?? 0n),
            }
          : undefined
        const pools = calculatePools(rehydratedCart.items)
        const { totalPrice, feeOnTop, totalPriceRaw, feeOnTopRaw } =
          calculatePricing(
            rehydratedCart.items,
            deserializedCurrency,
            cartData.current.feesOnTopBps,
            cartData.current.feesOnTopUsd,
            usdPrice
          )

        cartData.current = {
          ...cartData.current,
          chain:
            rehydratedCart.items.length > 0 ? rehydratedCart.chain : undefined,
          items: rehydratedCart.items,
          currency: deserializedCurrency,
          pools,
          totalPrice,
          totalPriceRaw,
          feeOnTop,
          feeOnTopRaw,
        }
        subscribers.current.forEach((callback) => callback())
        validate()
      }
    }
  }, [])

  useEffect(() => {
    const pools = calculatePools(cartData.current.items)
    const { totalPrice, feeOnTop, totalPriceRaw, feeOnTopRaw } =
      calculatePricing(
        cartData.current.items,
        cartCurrency,
        feesOnTopBps,
        feesOnTopUsd,
        usdPrice
      )
    cartData.current = {
      ...cartData.current,
      pools,
      totalPrice,
      totalPriceRaw,
      feesOnTopBps,
      feesOnTopUsd,
      feeOnTop,
      feeOnTopRaw,
    }
    commit()
  }, [feesOnTopBps, feesOnTopUsd, usdPrice, cartCurrency])

  const get = useCallback(() => cartData.current, [])
  const set = useCallback((value: Partial<Cart>) => {
    cartData.current = { ...cartData.current, ...value }
    commit()
  }, [])

  const subscribe = useCallback((callback: () => void) => {
    subscribers.current.add(callback)
    return () => subscribers.current.delete(callback)
  }, [])

  const commit = useCallback(() => {
    subscribers.current.forEach((callback) => callback())
    if (persist && typeof window !== 'undefined' && window.localStorage) {
      const serializedCurrency = cartData.current.currency
        ? {
            ...cartData.current.currency,
            usdPriceRaw: cartData.current.currency.usdPriceRaw?.toString(),
            currencyTotalRaw:
              cartData.current.currency.currencyTotalRaw?.toString(),
            usdTotalPriceRaw:
              cartData.current.currency.usdTotalPriceRaw?.toString(),
            balance: cartData.current.currency.balance?.toString(),
          }
        : undefined
      window.localStorage.setItem(
        CartStorageKey,
        JSON.stringify({
          ...cartData.current,
          currency: serializedCurrency,
          totalPriceRaw: undefined,
          feeOnTopRaw: undefined,
        })
      )
    }
  }, [persist])

  const calculatePools = useCallback((items: CartItem[]) => {
    const pools: Record<
      string,
      { prices: CartItemPrice[]; itemCount: number }
    > = {}
    items.forEach((item) => {
      if (item.poolId) {
        if (!pools[item.poolId] && item.poolPrices) {
          pools[item.poolId] = { prices: item.poolPrices, itemCount: 1 }
          item.price = item.poolPrices[0]
        } else if (item.poolPrices) {
          item.price = item.poolPrices[pools[item.poolId].itemCount]
          pools[item.poolId].itemCount += 1
        }
      }
    })
    return pools
  }, [])

  const calculatePricing = useCallback(
    (
      items: Cart['items'],
      currency?: Cart['currency'],
      feesOnTopBps?: Cart['feesOnTopBps'],
      feesOnTopUsd?: Cart['feesOnTopUsd'],
      usdPrice?: number
    ) => {
      let subtotal = 0
      let subtotalRaw = 0n
      let feeOnTop = 0
      let feeOnTopRaw = 0n
      items.forEach(({ price, order }) => {
        let amount = price?.amount?.decimal
        let amountRaw = BigInt(price?.amount?.raw || 0)

        if (amount && order?.quantity) {
          amount = amount * order.quantity
          amountRaw = amountRaw * BigInt(order.quantity)
        }
        subtotal += amount || 0
        subtotalRaw += amountRaw || 0n
      })
      if (feesOnTopBps) {
        feesOnTopBps.forEach((feeOnTopBps) => {
          const [_, feeBps] = feeOnTopBps.split(':')
          feeOnTop += (Number(feeBps || 0) / 10000) * subtotal
          feeOnTopRaw += (BigInt(feeBps || 0n) / 10000n) * subtotalRaw
        }, 0)
      } else if (feesOnTopUsd && usdPrice && currency && currency?.decimals) {
        feesOnTopUsd.forEach((feeOnTopItem) => {
          const [_, fee] = feeOnTopItem.split(':')
          const atomicUsdPrice = parseUnits(`${usdPrice}`, 6)
          const atomicFee = BigInt(fee)
          const convertedAtomicFee =
            atomicFee * BigInt(10 ** (currency?.decimals || 18))
          const currencyFee = convertedAtomicFee / atomicUsdPrice
          const parsedFee = formatUnits(currencyFee, currency.decimals || 18)
          feeOnTop += Number(parsedFee)
          feeOnTopRaw += currencyFee
        }, 0)
      }
      return {
        totalPrice: subtotal + feeOnTop,
        totalPriceRaw: subtotalRaw + feeOnTopRaw,
        feeOnTop,
        feeOnTopRaw,
      }
    },
    []
  )

  const fetchTokens = useCallback(
    async (tokenIds: string[], chainId: number, currencyAddress?: Address) => {
      if (!tokenIds || tokenIds.length === 0) {
        return { tokens: [] }
      }

      const reservoirChain = client?.chains.find(
        (chain) => chain.id === chainId
      )
      const url = new URL(`${reservoirChain?.baseApiUrl}/tokens/v7`)

      const query: paths['/tokens/v7']['get']['parameters']['query'] = {
        tokens: tokenIds,
        limit: 100,
        includeDynamicPricing: true,
        displayCurrency: currencyAddress,
      }
      if (client?.normalizeRoyalties !== undefined) {
        query.normalizeRoyalties = client?.normalizeRoyalties
      }
      setParams(url, query)
      const params = [url.href]
      if (client?.apiKey) {
        params.push(client.apiKey)
      }
      if (client?.version) {
        params.push(client.version)
      }

      const response: TokensSchema = await defaultFetcher(params)

      return { tokens: response.tokens }
    },
    [client]
  )

  const fetchOrders = useCallback(
    async (orderIds: string[], chainId: number, currencyAddress?: Address) => {
      if (!orderIds || orderIds.length === 0) {
        return { orders: [] }
      }

      const reservoirChain = client?.chains.find(
        (chain) => chain.id === chainId
      )

      const url = new URL(`${reservoirChain?.baseApiUrl}/orders/asks/v5`)

      const query: paths['/orders/asks/v5']['get']['parameters']['query'] = {
        ids: orderIds,
        limit: 1000,
        includeCriteriaMetadata: true,
        displayCurrency: currencyAddress,
      }
      if (client?.normalizeRoyalties !== undefined) {
        query.normalizeRoyalties = client?.normalizeRoyalties
      }
      setParams(url, query)
      const params = [url.href]
      if (client?.apiKey) {
        params.push(client.apiKey)
      }
      if (client?.version) {
        params.push(client.version)
      }

      const response: OrdersSchema = await defaultFetcher(params)

      return { orders: response.orders }
    },
    [client]
  )

  const convertTokenToItem = useCallback(
    (tokenData: Token): CartItem | undefined => {
      const token = tokenData.token
      const market = tokenData.market

      if (!token?.tokenId || !token.collection?.id) {
        return
      }
      const dynamicPricing = market?.floorAsk?.dynamicPricing

      let order:
        | undefined
        | {
            id: string
            quantityRemaining: number
            quantity: number
            maker: string
          } = undefined
      if (token.kind === 'erc1155' && market?.floorAsk) {
        order = {
          id: market?.floorAsk?.id || '',
          quantityRemaining: market?.floorAsk?.quantityRemaining || 1,
          quantity: 1,
          maker: market?.floorAsk?.maker || '',
        }
      }

      return {
        token: {
          id: token.tokenId,
          name: token.name || '',
        },
        collection: {
          id: token.collection.id,
          name: token.collection.name || '',
        },
        order: order,
        price:
          dynamicPricing?.kind === 'pool' ? undefined : market?.floorAsk?.price,
        poolId:
          dynamicPricing?.kind === 'pool'
            ? (dynamicPricing.data?.pool as string)
            : undefined,
        poolPrices:
          dynamicPricing?.kind === 'pool'
            ? (dynamicPricing.data?.prices as CartItemPrice[])
            : undefined,
      }
    },
    []
  )

  const convertOrderToItem = useCallback(
    (orderData: Order): CartItem | undefined => {
      let criteria = orderData.criteria?.data
      if (!criteria?.token?.tokenId || !criteria.collection?.id) {
        return
      }
      return {
        token: {
          id: criteria.token.tokenId,
          name: criteria.token.name || '',
        },
        collection: {
          id: criteria.collection.id,
          name: criteria.collection.name || '',
        },
        order: {
          id: orderData.id,
          quantityRemaining: orderData.quantityRemaining || 1,
          quantity: 1,
          maker: orderData.maker,
        },
        price: orderData.price,
        poolId: undefined,
        poolPrices: undefined,
      }
    },
    []
  )

  const clear = useCallback(() => {
    cartData.current = {
      ...cartData.current,
      items: [],
      pools: {},
      totalPrice: 0,
      feeOnTop: 0,
      chain: undefined,
      currency: undefined,
    }
    commit()
  }, [commit])

  const clearTransaction = useCallback(() => {
    cartData.current = {
      ...cartData.current,
      transaction: null,
      pendingTransactionId: undefined,
    }
    commit()
  }, [commit])

  const setQuantity = useCallback(
    (orderId: string, quantity: number) => {
      const updatedItems = [...cartData.current.items]
      let item = updatedItems.find((item) => item.order?.id === orderId)
      if (item?.order && (quantity > 0 || quantity == -1)) {
        if (quantity > item?.order?.quantityRemaining) {
          quantity = item?.order?.quantityRemaining
        }
        {
          item.order = {
            ...item.order,
            quantity: quantity,
          }
        }
      }

      if (quantity == -1) {
        cartData.current = {
          ...cartData.current,
          items: updatedItems,
        }
      } else {
        const { totalPrice, feeOnTop, totalPriceRaw, feeOnTopRaw } =
          calculatePricing(
            updatedItems,
            cartData.current.currency,
            cartData.current.feesOnTopBps,
            cartData.current.feesOnTopUsd,
            usdPrice
          )

        cartData.current = {
          ...cartData.current,
          items: updatedItems,
          totalPrice,
          totalPriceRaw,
          feeOnTopRaw,
          feeOnTop,
        }
      }

      commit()
    },
    [commit, usdPrice]
  )

  const validate = useCallback(async () => {
    try {
      if (cartData.current.items.length === 0) {
        return false
      }
      cartData.current = { ...cartData.current, isValidating: true }
      commit()

      const items = [...cartData.current.items]

      const positionMap =
        cartData.current.items.reduce((items, item, index) => {
          if (item.order?.id) {
            items[`${item.order.id}`] = index
          } else if (item.collection.id && item.token?.id) {
            items[`${item.collection.id}:${item.token.id}`] = index
          }
          return items
        }, {} as Record<string, number>) || {}

      const tokensToFetch: string[] = []
      const ordersToFetch: string[] = []

      //find tokens and order ids to fetch
      cartData.current.items.map((item) => {
        if (item.order?.id) {
          ordersToFetch.push(item.order.id)
        } else {
          const contract = item.collection.id.split(':')[0]
          tokensToFetch.push(`${contract}:${item.token.id}`)
        }
      })

      //fetch tokens and orders in tandem
      const promises: (
        | ReturnType<typeof fetchOrders>
        | ReturnType<typeof fetchTokens>
      )[] = []

      if (ordersToFetch.length > 0) {
        promises.push(
          fetchOrders(
            ordersToFetch,
            cartData.current.chain?.id as number,
            (cartData.current.currency?.address ??
              chainCurrency.address) as Address
          )
        )
      }

      if (tokensToFetch.length > 0) {
        promises.push(
          fetchTokens(
            tokensToFetch,
            cartData.current.chain?.id as number,
            (cartData.current.currency?.address ??
              chainCurrency.address) as Address
          )
        )
      }

      const responses = await Promise.allSettled(promises)

      // hashmap of items to remove { orderId/tokenId: item index }
      let itemsToRemove: Record<string, number> = {}

      responses.forEach((response) => {
        if (response.status === 'fulfilled') {
          const ordersResponse = response.value as OrdersSchema
          const tokensResponse = response.value as TokensSchema

          if (ordersResponse && ordersResponse.orders) {
            // process orders response
            ordersResponse.orders.map((order) => {
              let index = positionMap[order.id]
              if (
                address &&
                order.maker.toLowerCase() === address?.toLowerCase()
              ) {
                itemsToRemove[order.id] = index
              } else if (order.status !== 'active') {
                items[index] = {
                  ...items[index],
                  price: undefined,
                }
              }
            })
          } else if (tokensResponse && tokensResponse.tokens) {
            // process tokens response
            tokensResponse.tokens.map(({ token, market }) => {
              const index =
                positionMap[`${token?.collection?.id}:${token?.tokenId}`]

              if (
                address &&
                (token?.owner?.toLowerCase() === address?.toLowerCase() ||
                  market?.floorAsk?.maker?.toLowerCase() ===
                    address?.toLowerCase())
              ) {
                if (token?.collection?.id && token?.tokenId) {
                  itemsToRemove[`${token.collection.id}:${token.tokenId}`] =
                    index
                }
              } else {
                const dynamicPricing = market?.floorAsk?.dynamicPricing

                items[index] = {
                  ...items[index],
                  previousPrice: items[index].price,
                  price: market?.floorAsk?.price,
                  poolId:
                    dynamicPricing?.kind === 'pool'
                      ? (dynamicPricing.data?.pool as string)
                      : undefined,
                  poolPrices:
                    dynamicPricing?.kind === 'pool'
                      ? (dynamicPricing.data?.prices as CartItemPrice[])
                      : undefined,
                }
                if (token?.name) {
                  items[index].token.name = token.name
                }
                if (token?.collection?.name) {
                  items[index].collection.name = token.collection.name
                }
              }
            })
          }
        }
      })

      // Remove all items in itemsToRemove
      if (Object.values(itemsToRemove).length > 0) {
        Object.values(itemsToRemove).map((index) => {
          items.splice(index, 1)
        })
      }

      const pools = calculatePools(items)
      const currency = getCurrency(items)
      const { totalPrice, feeOnTop, totalPriceRaw, feeOnTopRaw } =
        calculatePricing(
          items,
          currency,
          cartData.current.feesOnTopBps,
          cartData.current.feesOnTopUsd,
          usdPrice
        )
      cartData.current = {
        ...cartData.current,
        items,
        pools,
        isValidating: false,
        totalPrice,
        totalPriceRaw,
        feeOnTop,
        feeOnTopRaw,
      }

      commit()
      return true
    } catch (e) {
      if (cartData.current.isValidating) {
        cartData.current.isValidating = false
        commit()
      }
      throw e
    }
  }, [fetchTokens, fetchOrders, address, usdPrice])

  const setCurrency = useCallback(
    (currency: EnhancedCurrency | undefined) => {
      const paymentToken = paymentTokens.find(
        (token) => token.address === currency?.address
      )
      if (paymentToken) {
        cartData.current = {
          ...cartData.current,
          currency: paymentToken,
        }
        validate()
        commit()
      }
    },
    [paymentTokens, commit, validate]
  )

  const getCurrency = useCallback(
    (items?: Cart['items'], chainId?: number) => {
      items = items ? items : cartData.current.items

      if (cartData.current.currency) {
        return cartData.current.currency
      }

      const includeListingCurrency =
        providerOptionsContext.alwaysIncludeListingCurrency !== false

      if (items.length > 0 && paymentTokens) {
        const firstValidItem = items.find((item) => item.price?.currency)
        if (includeListingCurrency) {
          const firstValidItemCurrency = firstValidItem?.price?.currency
          return {
            address: firstValidItemCurrency?.contract?.toLowerCase() as Address,
            decimals: firstValidItemCurrency?.decimals || 18,
            symbol: firstValidItemCurrency?.symbol || '',
            chainId: chainId || cartChain?.id || 1,
            name: firstValidItemCurrency?.name,
          }
        } else {
          return (
            paymentTokens.find(
              (token) =>
                token.address ===
                firstValidItem?.price?.currency?.contract?.toLowerCase()
            ) || paymentTokens[0]
          )
        }
      }

      return undefined
    },
    [
      paymentTokens,
      providerOptionsContext.alwaysIncludeListingCurrency,
      cartChain,
    ]
  )

  type AsyncAddToCartOrder = { orderId: string }
  type AsyncAddToCartToken = { id: string }
  type AddToCartToken = AsyncAddToCartToken | AsyncAddToCartOrder | Token

  const add = useCallback(
    async (items: AddToCartToken[], chainId: number) => {
      try {
        if (cartData.current.chain && chainId != cartData.current.chain?.id) {
          throw `ChainId: ${chainId}, is different than the cart chainId (${cartData.current.chain?.id})`
        }
        if (cartData.current.isValidating) {
          throw 'Currently validating, adding items temporarily disabled'
        }

        let updatedItems = [...cartData.current.items]
        const currentIds = cartData.current.items.map(
          (item) => `${item.collection.id}:${item.token.id}`
        )
        const currentOrderIds = cartData.current.items.map(
          (item) => item.order?.id
        )

        const tokensToFetch: string[] = []
        const tokens: Token[] = []
        const ordersToFetch: string[] = []

        const tokensByMaker = updatedItems.reduce((map, item) => {
          if (item.order) {
            const maker = item.order?.maker
            if (!map[maker]) {
              map[maker] = []
            }
            map[maker].push(`${item.collection.id}:${item.token.id}`)
          }
          return map
        }, {} as Record<string, string[]>)

        items.forEach((item) => {
          const token = item as Token
          const asyncToken = item as AsyncAddToCartToken
          const asyncOrder = item as AsyncAddToCartOrder
          if (token.token) {
            if (
              !currentIds.includes(
                `${token.token?.collection?.id}:${token.token?.tokenId}`
              )
            ) {
              tokens.push(token)
            }
          } else if (
            asyncToken &&
            asyncToken.id &&
            !currentIds.includes(asyncToken.id)
          ) {
            tokensToFetch.push(asyncToken.id)
          } else if (
            asyncOrder &&
            asyncOrder.orderId &&
            !currentOrderIds.includes(asyncOrder.orderId)
          ) {
            ordersToFetch.push(asyncOrder.orderId)
          }
        })

        let currency = getCurrency(updatedItems, chainId)

        const createItems = async () => {
          updatedItems = [...cartData.current.items]
          const promises: Promise<void>[] = []

          if (tokensToFetch.length > 0) {
            promises.push(
              new Promise(async (resolve) => {
                const { tokens: fetchedTokens } = await fetchTokens(
                  tokensToFetch,
                  chainId,
                  currency?.address
                )

                fetchedTokens?.forEach((tokenData) => {
                  const item = convertTokenToItem(tokenData)
                  const id = `${item?.collection.id}:${item?.token.id}`
                  const maker = tokenData.market?.floorAsk?.maker
                  const duplicateListingDetected =
                    item &&
                    maker &&
                    tokensByMaker[maker] &&
                    tokensByMaker[maker].includes(id)
                  if (duplicateListingDetected) {
                    client?.log(
                      [
                        'Detected adding duplicate listing to cart, aborting',
                        tokenData,
                        updatedItems,
                      ],
                      LogLevel.Error
                    )
                  } else if (item) {
                    updatedItems.push(item)
                  }
                })

                resolve()
              })
            )
          }

          if (ordersToFetch.length > 0) {
            promises.push(
              new Promise(async (resolve) => {
                const { orders: fetchedOrders } = await fetchOrders(
                  ordersToFetch,
                  chainId,
                  currency?.address
                )
                fetchedOrders?.forEach((orderData) => {
                  const item = convertOrderToItem(orderData)
                  const id = `${item?.collection.id}:${item?.token.id}`
                  const duplicateListingDetected =
                    item &&
                    tokensByMaker[orderData.maker] &&
                    tokensByMaker[orderData.maker].includes(id)
                  if (duplicateListingDetected) {
                    client?.log(
                      [
                        'Detected adding duplicate listing to cart, aborting',
                        orderData,
                        updatedItems,
                      ],
                      LogLevel.Error
                    )
                  } else if (item) {
                    updatedItems.push(item)
                  }
                })

                resolve()
              })
            )
          }

          if (promises.length > 0) {
            cartData.current.isValidating = true
            subscribers.current.forEach((callback) => callback())
          }

          await Promise.allSettled(promises)

          if (tokens.length > 0) {
            tokens.forEach((token) => {
              if (
                token.market?.floorAsk?.maker?.toLowerCase() !==
                  address?.toLowerCase() &&
                token.token?.owner?.toLowerCase() !== address?.toLowerCase()
              ) {
                const item = convertTokenToItem(token)
                if (item) {
                  updatedItems.push(item)
                }
              }
            })
          }
        }

        await createItems()
        if (!currency) {
          currency = getCurrency(updatedItems)
          //In the case any of the items are not in the correct currency, we need to refresh the items
          if (
            updatedItems.some(
              (item) => item.price?.currency?.contract !== currency?.address
            )
          ) {
            await createItems()
          }
        }

        const pools = calculatePools(updatedItems)
        const { totalPrice, feeOnTop, totalPriceRaw, feeOnTopRaw } =
          calculatePricing(
            updatedItems,
            currency,
            cartData.current.feesOnTopBps,
            cartData.current.feesOnTopUsd,
            usdPrice
          )

        cartData.current = {
          ...cartData.current,
          isValidating: false,
          items: updatedItems,
          totalPrice,
          totalPriceRaw,
          feeOnTop,
          feeOnTopRaw,
          pools,
          currency,
        }
        if (!cartData.current.chain) {
          cartData.current.chain =
            client?.chains.find((chain) => chain.id === chainId) ||
            client?.currentChain() ||
            undefined
        }
        commit()
      } catch (e) {
        if (cartData.current.isValidating) {
          cartData.current.isValidating = false
          commit()
        }
        throw e
      }
    },
    [fetchTokens, fetchOrders, commit, address, usdPrice]
  )

  /**
   * @param ids An array of order ids or token keys. Tokens should be in the format `collection:token`
   */

  const remove = useCallback(
    (ids: string[]) => {
      if (cartData.current.isValidating) {
        console.warn(
          'Currently validating, removing items temporarily disabled'
        )
        return
      }
      const updatedItems: CartItem[] = []
      const removedItems: CartItem[] = []
      cartData.current.items.forEach((item) => {
        const key = `${item.collection.id}:${item.token.id}`
        const orderId = item.order?.id
        if (orderId && ids.includes(orderId)) {
          removedItems.push(item)
        } else if (ids.includes(key)) {
          removedItems.push(item)
        } else {
          updatedItems.push(item)
        }
      })
      const pools = calculatePools(updatedItems)
      const { totalPrice, feeOnTop, totalPriceRaw, feeOnTopRaw } =
        calculatePricing(
          updatedItems,
          cartData.current.currency,
          cartData.current.feesOnTopBps,
          cartData.current.feesOnTopUsd,
          usdPrice
        )

      //Suppress pool price changes if the removed item was from the pool
      const removedPoolIds = removedItems.reduce((poolIds, item) => {
        if (item.poolId) {
          poolIds.push(item.poolId)
        }
        return poolIds
      }, [] as string[])

      updatedItems.forEach((item) => {
        if (item.poolId && removedPoolIds.includes(item.poolId)) {
          item.previousPrice = item.price
        }
      })

      cartData.current = {
        ...cartData.current,
        items: updatedItems,
        pools,
        totalPrice,
        totalPriceRaw,
        feeOnTop,
        feeOnTopRaw,
        currency:
          updatedItems.length > 0 ? cartData.current.currency : undefined,
      }
      if (updatedItems.length === 0) {
        cartData.current.chain = undefined
      }
      commit()
    },
    [usdPrice]
  )

  const checkout = useCallback(
    async (options: BuyTokenOptions = {}) => {
      if (!client) {
        throw 'Reservoir SDK not initialized'
      }

      const { chain: activeChain } = await getNetwork()

      if (
        cartData.current.chain &&
        cartData.current.chain?.id !== activeChain?.id
      ) {
        const chain = await switchNetworkAsync?.(cartData.current.chain.id)
        if (chain?.id !== cartData.current.chain.id) {
          throw 'Active chain does not match cart chain'
        }
      }

      const wagmiWalletClient = await getWalletClient({
        chainId: cartData.current.chain?.id,
      })

      const wallet = walletClient || wagmiWalletClient

      if (!wallet) {
        throw 'Wallet/Signer not available'
      }
      const tokens = cartData.current.items.reduce(
        (items, { token, collection, price, order }) => {
          if (price) {
            const contract = collection.id.split(':')[0]
            items?.push({
              token: order?.id ? undefined : `${contract}:${token.id}`,
              orderId: order?.id,
              quantity: order?.quantity,
            })
          }
          return items
        },
        [] as Parameters<ReservoirClientActions['buyToken']>['0']['items']
      )

      if (!tokens || tokens.length === 0) {
        throw 'Cart is empty'
      }
      const chainCurrency = useChainCurrency(cartData.current.chain?.id || 1)
      const currencyChain = client.chains.find(
        (chain) => chainCurrency.chainId === chain.id
      )
      const feeOnTop = cartData.current.feeOnTop ? cartData.current.feeOnTop : 0
      const expectedPrice = cartData.current.totalPrice - feeOnTop
      let currencyDecimals = cartData.current.currency?.decimals || 18

      options.currency = cartData.current.currency?.address

      if (feeOnTop) {
        if (cartData.current.feesOnTopBps) {
          const fixedFees = cartData.current.feesOnTopBps.map((fullFee) => {
            const [referrer, feeBps] = fullFee.split(':')
            const fee = Math.floor(
              Number(
                parseUnits(`${expectedPrice}`, currencyDecimals) *
                  BigInt(feeBps)
              ) / 10000
            )
            const atomicUnitsFee = formatUnits(BigInt(fee), 0)
            return `${referrer}:${atomicUnitsFee}`
          })
          options.feesOnTop = fixedFees
        } else if (cartData.current.feesOnTopUsd && usdPrice) {
          options.feesOnTop = cartData.current.feesOnTopUsd.map((feeOnTop) => {
            const [recipient, fee] = feeOnTop.split(':')
            const atomicUsdPrice = parseUnits(`${usdPrice}`, 6)
            const atomicFee = BigInt(fee)
            const convertedAtomicFee =
              atomicFee * BigInt(10 ** cartData.current?.currency?.decimals!)
            const currencyFee = convertedAtomicFee / atomicUsdPrice
            const parsedFee = formatUnits(currencyFee, 0)
            return `${recipient}:${parsedFee}`
          })
        }
      }

      if (options.partial === undefined) {
        options.partial = true
      }

      const transactionId = `${new Date().getTime()}`
      cartData.current = {
        ...cartData.current,
        pendingTransactionId: transactionId,
        transaction: {
          id: transactionId,
          chain: cartData.current.chain || currencyChain || client.chains[0],
          items: cartData.current.items,
          status: CheckoutStatus.Approving,
        },
      }
      commit()

      client.actions
        .buyToken({
          chainId: cartData.current.chain?.id,
          expectedPrice: {
            [options.currency || zeroAddress]: {
              amount: expectedPrice,
              raw: parseUnits(`${expectedPrice}`, currencyDecimals),
              currencyAddress: options.currency || zeroAddress,
              currencyDecimals: currencyDecimals,
            },
          },
          wallet,
          items: tokens,
          options,
          onProgress: (steps: Execute['steps'], path: Execute['path']) => {
            if (!steps) {
              return
            }
            if (transactionId != cartData.current.pendingTransactionId) {
              return
            }

            let status =
              cartData.current.transaction?.status || CheckoutStatus.Approving

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

            if (currentStep.error) {
              return
            }

            executableSteps.findIndex((step) => {
              currentStepItem = step.items?.find(
                (item) => item.status === 'incomplete'
              )
              return currentStepItem
            })

            const transactionSteps = steps.filter(
              (step) =>
                step.kind === 'transaction' &&
                step.items &&
                step.items?.length > 0
            )

            if (
              transactionSteps.length > 0 &&
              transactionSteps.every((step) =>
                step.items?.every((item) => item.txHashes)
              )
            ) {
              status = CheckoutStatus.Finalizing
              if (cartData.current.items.length > 0) {
                cartData.current.items = []
                cartData.current.pools = {}
                cartData.current.totalPrice = 0
                cartData.current.totalPriceRaw = 0n
                cartData.current.feeOnTop = 0
                cartData.current.feeOnTopRaw = 0n
                cartData.current.currency = undefined
                cartData.current.chain = undefined
              }
            }
            if (
              steps.every(
                (step) =>
                  !step.items ||
                  step.items.length == 0 ||
                  step.items?.every((item) => item.status === 'complete')
              )
            ) {
              status = CheckoutStatus.Complete
            }

            if (
              cartData.current.transaction?.status != status &&
              (status === CheckoutStatus.Finalizing ||
                status === CheckoutStatus.Complete)
            ) {
              cartData.current.items = []
              cartData.current.pools = {}
              cartData.current.totalPrice = 0
              cartData.current.totalPriceRaw = 0n
              cartData.current.feeOnTop = 0
              cartData.current.feeOnTopRaw = 0n
              cartData.current.currency = undefined
              cartData.current.chain = undefined
            }

            if (cartData.current.transaction) {
              cartData.current.transaction.status = status
              cartData.current.transaction.currentStep = currentStep
              if (currentStepItem) {
                cartData.current.transaction.txHashes =
                  currentStepItem?.txHashes
                cartData.current.transaction.steps = steps
                cartData.current.transaction.path = path
              }
            }
            commit()
          },
        })
        .catch((e: any) => {
          if (transactionId != cartData.current.pendingTransactionId) {
            return
          }
          let error = e as any
          let errorType = CheckoutTransactionError.Unknown
          const errorStatus = (error as any)?.statusCode

          if (error?.message && error?.message.includes('ETH balance')) {
            errorType = CheckoutTransactionError.InsufficientBalance
          } else if (
            (error?.code && error?.code == 4001) ||
            error?.message?.includes('rejected')
          ) {
            errorType = CheckoutTransactionError.UserDenied
          } else {
            let message = 'Oops, something went wrong. Please try again.'
            if (errorStatus >= 400 && errorStatus < 500) {
              message = error.message
            } else if (error?.type && error?.type === 'price mismatch') {
              errorType = CheckoutTransactionError.PiceMismatch
              message = error.message
            } else if (error.name === 'TransactionTimeoutError') {
              errorType = CheckoutTransactionError.TransactionTimeOut
              message =
                'Your transaction was sent, but is taking longer to process.'
            }

            //@ts-ignore: Should be fixed in an update to typescript
            error = new Error(message, {
              cause: error,
            })
          }
          if (cartData.current.transaction) {
            cartData.current.transaction.status = CheckoutStatus.Idle
            cartData.current.transaction.error = error
            cartData.current.transaction.errorType = errorType
            if (
              cartData.current.chain?.id ==
              cartData.current.transaction.chain.id
            ) {
              const items = [...cartData.current.transaction.items]
              const pools = calculatePools(items)
              const currency = getCurrency(items)

              const { totalPrice, feeOnTop, totalPriceRaw, feeOnTopRaw } =
                calculatePricing(
                  items,
                  currency,
                  cartData.current.feesOnTopBps,
                  cartData.current.feesOnTopUsd,
                  usdPrice
                )
              cartData.current.items = items
              cartData.current.pools = pools
              cartData.current.currency = currency
              cartData.current.totalPrice = totalPrice
              cartData.current.totalPriceRaw = totalPriceRaw
              cartData.current.feeOnTop = feeOnTop
              cartData.current.feeOnTopRaw = feeOnTopRaw
              cartData.current.chain = cartData.current.transaction.chain
            }
            commit()
            validate()
          }
        })
    },
    [client, switchNetworkAsync, usdPrice, walletClient]
  )

  return {
    get,
    set,
    subscribe,
    setQuantity,
    setCurrency,
    add,
    remove,
    clear,
    clearTransaction,
    validate,
    checkout,
  }
}

export const CartContext = createContext<ReturnType<typeof cartStore> | null>(
  null
)

type CartProviderProps = {
  children: ReactNode
  feesOnTopBps?: string[]
  feesOnTopUsd?: string[]
  persist?: boolean
}

export const CartProvider: FC<CartProviderProps> = function ({
  children,
  feesOnTopBps,
  feesOnTopUsd,
  persist,
}) {
  return (
    <CartContext.Provider
      value={cartStore({ feesOnTopBps, feesOnTopUsd, persist })}
    >
      {children}
    </CartContext.Provider>
  )
}
