import { isOpenSeaBanned, paths, setParams } from '@reservoir0x/reservoir-sdk'
import { useReservoirClient, useTokens } from '../hooks'
import { defaultFetcher } from '../lib/swr'
import React, { createContext, useCallback, useRef, ReactNode } from 'react'
import { Chain } from 'wagmi'

type Token = NonNullable<ReturnType<typeof useTokens>['data'][0]>
type FloorAsk = NonNullable<NonNullable<Token['market']>['floorAsk']>
type CartItemPrice = FloorAsk['price']

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
  items: CartItem[]
  isValidating: boolean
  chain: Chain | null
  transaction: {
    txHash?: string
    chain: Chain
    items: Record<string, CartItem>
  } | null
}

function cartStore() {
  const cartData = useRef<Cart>({
    items: [],
    isValidating: false,
    chain: null,
    transaction: null,
  })

  const subscribers = useRef(new Set<() => void>())
  const client = useReservoirClient()

  const get = useCallback(() => cartData.current, [])
  const set = useCallback((value: Partial<Cart>) => {
    cartData.current = { ...cartData.current, ...value }
    subscribers.current.forEach((callback) => callback())
  }, [])

  const subscribe = useCallback((callback: () => void) => {
    subscribers.current.add(callback)
    return () => subscribers.current.delete(callback)
  }, [])

  const clear = useCallback(() => {
    cartData.current = { ...cartData.current, items: [] }
    subscribers.current.forEach((callback) => callback())
  }, [])

  const add = useCallback((item: CartItem) => {
    const isDuplicate = cartData.current.items.some(
      ({ token, collection }) =>
        token.id == item.token.id && collection.id == item.collection.id
    )
    if (!isDuplicate) {
      cartData.current = {
        ...cartData.current,
        items: [...cartData.current.items, item],
      }
      subscribers.current.forEach((callback) => callback())
    }
  }, [])

  const remove = useCallback((tokenId: string, collectionId: string) => {
    const items = cartData.current.items.filter(
      ({ token, collection }) =>
        tokenId !== token.id && collectionId === collection.id
    )
    cartData.current = { ...cartData.current, items }
    subscribers.current.forEach((callback) => callback())
  }, [])

  const validate = useCallback(async () => {
    cartData.current = { ...cartData.current, isValidating: true }
    subscribers.current.forEach((callback) => callback())
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
    cartData.current = { ...cartData.current, items, isValidating: false }
    subscribers.current.forEach((callback) => callback())
  }, [client])

  return {
    get,
    set,
    subscribe,
    add,
    remove,
    clear,
    validate,
  }
}

export const CartContext = createContext<ReturnType<typeof cartStore> | null>(
  null
)

export const CartProvider = function ({ children }: { children: ReactNode }) {
  return (
    <CartContext.Provider value={cartStore()}>{children}</CartContext.Provider>
  )
}
