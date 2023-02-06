import { Cart, CartContext } from '../context/CartProvider'
import { useContext, useSyncExternalStore } from 'react'

export default function useCart<SelectorOutput>(
  selector: (store: Cart) => SelectorOutput
) {
  const cart = useContext(CartContext)
  if (!cart) {
    throw new Error('Cart not found')
  }

  const data = useSyncExternalStore(
    cart.subscribe,
    () => selector(cart.get()),
    () => selector(cart.get())
  )
  const { clear, remove, add, validate, checkout, clearTransaction } = cart

  return {
    data,
    clear,
    clearTransaction,
    remove,
    add,
    validate,
    checkout,
    set: cart.set,
  }
}
