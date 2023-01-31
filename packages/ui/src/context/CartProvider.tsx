import {
  Execute,
  ReservoirClientActions,
  isOpenSeaBanned,
  paths,
  setParams,
} from '@reservoir0x/reservoir-sdk'
import { useReservoirClient, useTokens, useChainCurrency } from '../hooks'
import { defaultFetcher } from '../lib/swr'
import React, {
  createContext,
  useCallback,
  useRef,
  ReactNode,
  useEffect,
  FC,
} from 'react'
import { Chain, useSigner } from 'wagmi'
import * as allChains from 'wagmi/chains'
import { constants, utils } from 'ethers'
import { toFixed } from '../lib/numbers'
import { formatUnits } from 'ethers/lib/utils.js'
import { version } from '../../package.json'

type Token = NonNullable<ReturnType<typeof useTokens>['data'][0]>
type FloorAsk = NonNullable<NonNullable<Token['market']>['floorAsk']>
type CartItemPrice = FloorAsk['price']
type Currency = NonNullable<NonNullable<CartItemPrice>['currency']>
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
  price: CartItemPrice
  previousPrice?: CartItemPrice
  isBannedOnOpensea?: boolean
}

export type Cart = {
  totalPrice: number
  currency?: NonNullable<CartItemPrice>['currency']
  referrer?: string
  referrerFeeBps?: number
  items: CartItem[]
  isValidating: boolean
  chain?: Chain
  pendingTransactionId?: string
  transaction: {
    id?: string
    txHash?: string
    chain: Chain
    items: CartItem[]
    error?: Error
    errorType?: CheckoutTransactionError
    status: CheckoutStatus
    steps?: Execute['steps']
  } | null
}

const CartStorageKey = `reservoirkit.cart.${version}`

type CartStoreProps = {
  referrer?: string
  referrerFeeBps?: number
  persist?: boolean
}

function cartStore({
  referrer,
  referrerFeeBps,
  persist = true,
}: CartStoreProps) {
  const chainCurrency = useChainCurrency()
  const cartData = useRef<Cart>({
    totalPrice: 0,
    items: [],
    isValidating: false,
    transaction: null,
  })

  const subscribers = useRef(new Set<() => void>())
  const client = useReservoirClient()
  const { data: signer } = useSigner()

  useEffect(() => {
    if (persist && typeof window !== 'undefined' && window.localStorage) {
      const storedCart = window.localStorage.getItem(CartStorageKey)
      if (storedCart) {
        const rehydratedCart: Cart = JSON.parse(storedCart)
        const chain = Object.values(allChains).find(
          (chain) => rehydratedCart.chain?.id === chain.id
        )
        const currency = getCartCurrency(cartData.current.items)
        const totalPrice = calculateTotal(
          cartData.current.items,
          currency,
          cartData.current.referrerFeeBps
        )
        cartData.current = {
          ...cartData.current,
          chain: chain || cartData.current.chain,
          items: rehydratedCart.items,
          totalPrice,
          currency,
        }
        subscribers.current.forEach((callback) => callback())
        validate()
      }
    }
  }, [persist])

  useEffect(() => {
    const feeBps =
      referrer !== undefined && referrerFeeBps !== undefined
        ? referrerFeeBps
        : undefined
    const referrerAddress =
      referrer !== undefined && referrerFeeBps !== undefined
        ? referrer
        : undefined
    const currency = getCartCurrency(cartData.current.items)
    const totalPrice = calculateTotal(cartData.current.items, currency, feeBps)
    cartData.current = {
      ...cartData.current,
      totalPrice,
      currency,
      referrer: referrerAddress,
      referrerFeeBps: feeBps,
    }
    commit()
  }, [referrer, referrerFeeBps])

  //todo if the chain changes we need to clear the cart
  useEffect(() => {
    const currency = getCartCurrency(cartData.current.items)
    const chain = Object.values(allChains).find(
      (chain) => chain.id === chainCurrency.chainId
    )
    cartData.current = {
      ...cartData.current,
      currency: currency,
      chain,
    }
    commit()
  }, [chainCurrency])

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
      window.localStorage.setItem(
        CartStorageKey,
        JSON.stringify(cartData.current)
      )
    }
  }, [persist])

  const calculateTotal = useCallback(
    (items: CartItem[], currency?: Currency, referrerFeeBps?: number) => {
      let subtotal = items.reduce((total, { price }) => {
        let amount = price?.amount?.decimal
        if (price?.currency?.contract !== currency?.contract) {
          amount = price?.amount?.native
        }
        return (total += amount || 0)
      }, 0)
      if (referrerFeeBps) {
        const fee = (referrerFeeBps / 10000) * subtotal

        subtotal = subtotal + fee
      }
      return subtotal
    },
    []
  )

  const getCartCurrency = useCallback(
    (items: CartItem[]): Currency | undefined => {
      let currencies = new Set<string>()
      let currenciesData: Record<string, Currency> = {}
      for (let i = 0; i < items.length; i++) {
        const currency = items[i].price?.currency
        if (currency?.contract) {
          currencies.add(currency.contract)
          currenciesData[currency.contract] = currency
        }
        if (currencies.size > 1) {
          break
        }
      }
      if (currencies.size > 1) {
        return chainCurrency
      } else if (currencies.size > 0) {
        return Object.values(currenciesData)[0]
      }
    },
    [chainCurrency]
  )

  const clear = useCallback(() => {
    cartData.current = { ...cartData.current, items: [], totalPrice: 0 }
    commit()
  }, [])

  const clearTransaction = useCallback(() => {
    cartData.current = {
      ...cartData.current,
      transaction: null,
      pendingTransactionId: undefined,
    }
    commit()
  }, [])

  const add = useCallback((items: CartItem[]) => {
    const updatedItems = [...cartData.current.items]
    items.forEach((item) => {
      const isDuplicate = cartData.current.items.some(
        ({ token, collection }) =>
          token.id == item.token.id && collection.id == item.collection.id
      )
      if (!isDuplicate) {
        updatedItems.push(item)
      }
    })
    const currency = getCartCurrency(updatedItems)
    const totalPrice = calculateTotal(
      updatedItems,
      currency,
      cartData.current.referrerFeeBps
    )
    cartData.current = {
      ...cartData.current,
      items: updatedItems,
      totalPrice,
      currency,
    }
    commit()
  }, [])

  const remove = useCallback(
    (items: { tokenId: string; collectionId: string }[]) => {
      const keys = items.map((item) => `${item.collectionId}:${item.tokenId}`)
      const updatedItems = cartData.current.items.filter(
        ({ token, collection }) => {
          const key = `${collection.id}:${token.id}`
          return !keys.includes(key)
        }
      )
      const currency = getCartCurrency(updatedItems)
      const totalPrice = calculateTotal(
        updatedItems,
        currency,
        cartData.current.referrerFeeBps
      )
      cartData.current = {
        ...cartData.current,
        items: updatedItems,
        totalPrice,
        currency,
      }
      commit()
    },
    []
  )

  const validate = useCallback(async () => {
    if (cartData.current.items.length === 0) {
      return false
    }
    cartData.current = { ...cartData.current, isValidating: true }
    commit()
    const tokenIds = cartData.current.items.reduce((tokens, item) => {
      const contract = item.collection.id.split(':')[0]
      tokens.push(`${contract}:${item.token.id}`)
      return tokens
    }, [] as string[])

    const url = new URL(`${client?.apiBase}/tokens/v5`)
    const query: paths['/tokens/v5']['get']['parameters']['query'] = {
      tokens: tokenIds,
      limit: 100,
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
    type TokensSchema = paths['/tokens/v5']['get']['responses']['200']['schema']
    const promises = await Promise.allSettled([
      defaultFetcher(params),
      isOpenSeaBanned(tokenIds),
    ])
    const response: TokensSchema =
      promises[0].status === 'fulfilled' ? promises[0].value : {}
    const flaggedStatuses =
      promises[1].status === 'fulfilled' ? promises[1].value : {}

    const tokenMap =
      response.tokens?.reduce((tokens, token) => {
        if (token.token?.tokenId && token.token.collection?.id) {
          tokens[`${token.token.collection.id}:${token.token.tokenId}`] = token
        }
        return tokens
      }, {} as Record<string, NonNullable<TokensSchema['tokens']>['0']>) || {}
    const items = cartData.current.items.map((item) => {
      const token = tokenMap[`${item.collection.id}:${item.token.id}`]
      const flaggedStatus =
        flaggedStatuses[`${item.collection.id}:${item.token.id}`]
      if (token) {
        const updatedItem = {
          ...item,
          previousPrice: item.price,
          price: token.market?.floorAsk?.price,
        }
        if (token.token?.name) {
          updatedItem.token.name = token.token.name
        }
        if (token.token?.collection?.name) {
          updatedItem.collection.name = token.token.collection.name
        }
        if (flaggedStatus !== undefined) {
          updatedItem.isBannedOnOpensea = flaggedStatus
        }
        return updatedItem
      }
      return item
    })
    const currency = getCartCurrency(items)
    const totalPrice = calculateTotal(
      items,
      currency,
      cartData.current.referrerFeeBps
    )
    cartData.current = {
      ...cartData.current,
      items,
      isValidating: false,
      totalPrice,
      currency,
    }
    commit()
    return true
  }, [client])

  const checkout = useCallback(
    async (options: BuyTokenOptions = {}) => {
      if (!client) {
        throw 'Reservoir SDK not initialized'
      }

      if (!signer) {
        throw 'Signer not available'
      }

      let isMixedCurrency = false
      const tokens = cartData.current.items.reduce(
        (items, { token, collection, price }) => {
          if (price) {
            const contract = collection.id.split(':')[0]
            items?.push({ tokenId: token.id, contract })
            if (
              price.currency?.contract != cartData.current.currency?.contract
            ) {
              isMixedCurrency = true
            }
          }
          return items
        },
        [] as Parameters<ReservoirClientActions['buyToken']>['0']['tokens']
      )

      if (!tokens || tokens.length === 0) {
        throw 'Cart is empty'
      }

      const currencyChain = Object.values(allChains).find(
        (chain) => (chainCurrency.chainId = chain.id)
      )
      const expectedPrice = cartData.current.totalPrice

      if (isMixedCurrency) {
        options.currency = constants.AddressZero
      }

      if (cartData.current.referrer && cartData.current.referrerFeeBps) {
        const price = toFixed(
          expectedPrice,
          cartData.current.currency?.decimals || 18
        )
        const fee = utils
          .parseUnits(`${price}`, cartData.current.currency?.decimals)
          .mul(cartData.current.referrerFeeBps)
          .div(10000)
        const atomicUnitsFee = formatUnits(fee, 0)
        options.feesOnTop = [`${cartData.current.referrer}:${atomicUnitsFee}`]
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
          chain: cartData.current.chain || currencyChain || allChains.mainnet,
          items: cartData.current.items,
          status: CheckoutStatus.Approving,
        },
      }
      commit()

      client.actions
        .buyToken({
          expectedPrice,
          signer,
          tokens: tokens,
          options,
          onProgress: (steps: Execute['steps']) => {
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

            let currentStepItem:
              | NonNullable<Execute['steps'][0]['items']>[0]
              | undefined

            executableSteps.findIndex((step) => {
              currentStepItem = step.items?.find(
                (item) => item.status === 'incomplete'
              )
              return currentStepItem
            })

            if (currentStepItem) {
              if (currentStepItem.txHash) {
                status = CheckoutStatus.Finalizing
                if (cartData.current.items.length > 0) {
                  cartData.current.items = []
                  cartData.current.totalPrice = 0
                  cartData.current.currency = undefined
                }
              }
            } else if (
              steps.every(
                (step) =>
                  !step.items ||
                  step.items.length == 0 ||
                  step.items?.every((item) => item.status === 'complete')
              )
            ) {
              status = CheckoutStatus.Complete
            }

            if (cartData.current.transaction) {
              cartData.current.transaction.status = status
              if (currentStepItem) {
                cartData.current.transaction.txHash = currentStepItem?.txHash
                cartData.current.transaction.steps = steps
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
          if (error?.message && error?.message.includes('ETH balance')) {
            errorType = CheckoutTransactionError.InsufficientBalance
          } else if (error?.code && error?.code == 4001) {
            errorType = CheckoutTransactionError.UserDenied
          } else {
            let message = 'Oops, something went wrong. Please try again.'
            if (error?.type && error?.type === 'price mismatch') {
              errorType = CheckoutTransactionError.PiceMismatch
              message = error.message
            }
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
              const currency = getCartCurrency(items)
              const totalPrice = calculateTotal(
                items,
                currency,
                cartData.current.referrerFeeBps
              )
              cartData.current.items = items
              cartData.current.currency = currency
              cartData.current.totalPrice = totalPrice
            }
            commit()
            validate()
          }
        })
    },
    [client, signer]
  )

  return {
    get,
    set,
    subscribe,
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
  referrer?: string
  referrerFeeBps?: number
  persist?: boolean
}

export const CartProvider: FC<CartProviderProps> = function ({
  children,
  referrer,
  referrerFeeBps,
  persist,
}) {
  return (
    <CartContext.Provider
      value={cartStore({ referrer, referrerFeeBps, persist })}
    >
      {children}
    </CartContext.Provider>
  )
}
