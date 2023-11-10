import { useCart, useChainCurrency, usePaymentTokens } from '../../hooks'
import React, { FC, ReactNode, useEffect, useMemo, useState } from 'react'
import { useAccount, useNetwork } from 'wagmi'
import { Address } from 'viem'
import {
  Cart,
  CheckoutStatus,
  CheckoutTransactionError,
} from '../../context/CartProvider'

export enum CartPopoverStep {
  Idle,
  SelectPayment,
}

type ChildrenProps = {
  loading: boolean
  currency?: NonNullable<Cart['currency']>
  totalPrice: number
  totalPriceRaw: bigint
  feeOnTop?: number
  feeOnTopRaw?: bigint
  usdPrice: number | null
  balance?: bigint
  hasEnoughCurrency: boolean
  items: Cart['items']
  unavailableItems: Cart['items']
  priceChangeItems: Cart['items']
  transaction?: Cart['transaction']
  blockExplorerBaseUrl: string
  cartChain: Cart['chain']
  paymentTokens?: NonNullable<Cart['currency']>[]
  checkout: ReturnType<typeof useCart>['checkout']
  clear: ReturnType<typeof useCart>['clear']
  remove: ReturnType<typeof useCart>['remove']
  add: ReturnType<typeof useCart>['add']
  validate: ReturnType<typeof useCart>['validate']
  cartPopoverStep: CartPopoverStep
  setCartPopoverStep: React.Dispatch<React.SetStateAction<CartPopoverStep>>
  setCurrency: ReturnType<typeof useCart>['setCurrency']
}

type Props = {
  open: boolean
  children: (props: ChildrenProps) => ReactNode
}

export const CartPopoverRenderer: FC<Props> = ({ open, children }) => {
  const [cartPopoverStep, setCartPopoverStep] = useState<CartPopoverStep>(
    CartPopoverStep.Idle
  )
  const [hasEnoughCurrency, setHasEnoughCurrency] = useState(true)
  const {
    data,
    clear,
    clearTransaction,
    validate,
    remove,
    add,
    checkout,
    setCurrency,
  } = useCart((cart) => cart)
  const {
    isValidating,
    totalPrice,
    totalPriceRaw,
    items,
    currency,
    transaction,
    feeOnTop,
    feeOnTopRaw,
    chain: cartChain,
  } = data

  const usdPrice = currency?.usdPrice ?? 0

  const { chains } = useNetwork()
  const chain = chains.find((chain) => chain.id === transaction?.chain.id)
  const chainCurrency = useChainCurrency(cartChain?.id)
  const blockExplorerBaseUrl =
    chain?.blockExplorers?.default?.url || 'https://etherscan.io'

  useEffect(() => {
    if (open) {
      validate()
      setCartPopoverStep(CartPopoverStep.Idle)
    } else if (
      transaction?.status === CheckoutStatus.Complete ||
      transaction?.error
    ) {
      clearTransaction()
    }
  }, [open])

  const unavailableItems = useMemo(
    () => items.filter((item) => !item.price),
    [items]
  )
  const priceChangeItems = useMemo(
    () =>
      items.filter(
        ({ previousPrice, price }) =>
          previousPrice &&
          price?.amount?.decimal !== undefined &&
          previousPrice.amount?.decimal !== price?.amount?.decimal &&
          previousPrice.currency?.contract === price?.currency?.contract
      ),
    [items]
  )
  const { address } = useAccount()
  const paymentTokens = usePaymentTokens(
    address !== undefined,
    address as Address,
    currency
      ? {
          symbol: currency.symbol as string,
          address: currency?.address as Address,
          name: currency?.name,
          decimals: currency.decimals as number,
          chainId: currency.chainId,
        }
      : chainCurrency,
    totalPriceRaw - (feeOnTopRaw ?? 0n),
    cartChain?.id,
    false,
    true
  )

  useEffect(() => {
    if (currency?.balance !== undefined) {
      if (!currency?.balance) {
        setHasEnoughCurrency(false)
      } else if (BigInt(currency.balance) < totalPriceRaw) {
        setHasEnoughCurrency(false)
      } else {
        setHasEnoughCurrency(true)
      }
    }
  }, [totalPriceRaw, currency])

  useEffect(() => {
    if (
      hasEnoughCurrency &&
      transaction?.errorType === CheckoutTransactionError.InsufficientBalance
    ) {
      setHasEnoughCurrency(false)
    }
  }, [transaction])

  return (
    <>
      {children({
        loading: isValidating,
        items,
        unavailableItems,
        priceChangeItems,
        currency,
        totalPrice,
        totalPriceRaw,
        feeOnTop,
        feeOnTopRaw,
        usdPrice,
        hasEnoughCurrency,
        balance: currency?.balance ? BigInt(currency?.balance) : undefined,
        transaction,
        blockExplorerBaseUrl,
        cartChain,
        paymentTokens,
        checkout,
        clear: () => {
          clear()
          setCartPopoverStep(CartPopoverStep.Idle)
        },
        remove,
        add,
        validate,
        cartPopoverStep,
        setCartPopoverStep,
        setCurrency,
      })}
    </>
  )
}

export default CartPopoverRenderer
