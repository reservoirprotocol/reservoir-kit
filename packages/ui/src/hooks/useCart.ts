import { Cart, CartContext } from '../context/CartProvider'
import { useContext, useSyncExternalStore } from 'react'

export default function useCart<SelectorOutput>(
  selector: (store: Cart) => SelectorOutput
): [SelectorOutput, (value: Partial<Cart>) => void] {
  const cart = useContext(CartContext)
  if (!cart) {
    throw new Error('Cart not found')
  }

  const state = useSyncExternalStore(cart.subscribe, () => selector(cart.get()))

  return [state, cart.set]
}
