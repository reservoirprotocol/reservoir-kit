import React, { createContext, useCallback, useRef, ReactNode } from 'react'
import { Chain } from 'wagmi'

export type CartToken = {
  tokenId: string
  contract: string
  price: string
}

export type Cart = {
  tokens: Record<string, CartToken>
  chain: Chain | null
  transaction: {
    txHash?: string
    chain: Chain
    tokens: Record<string, CartToken>
  } | null
}

function cartStore() {
  const cartData = useRef<Cart>({
    tokens: {},
    chain: null,
    transaction: null,
  })

  const get = useCallback(() => cartData.current, [])

  const subscribers = useRef(new Set<() => void>())

  const set = useCallback((value: Partial<Cart>) => {
    cartData.current = { ...cartData.current, ...value }
    subscribers.current.forEach((callback) => callback())
  }, [])

  const subscribe = useCallback((callback: () => void) => {
    subscribers.current.add(callback)
    return () => subscribers.current.delete(callback)
  }, [])

  return {
    get,
    set,
    subscribe,
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
