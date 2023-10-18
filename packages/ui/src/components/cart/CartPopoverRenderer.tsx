import { useCart, useReservoirClient } from '../../hooks'
import React, { FC, ReactNode, useEffect, useMemo, useState } from 'react'
import { useAccount, useBalance, useNetwork } from 'wagmi'
import { zeroAddress } from 'viem'
import { UseBalanceToken } from '../../types/wagmi'
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
  checkout: ReturnType<typeof useCart>['checkout']
  clear: ReturnType<typeof useCart>['clear']
  remove: ReturnType<typeof useCart>['remove']
  add: ReturnType<typeof useCart>['add']
  validate: ReturnType<typeof useCart>['validate']
  cartPopoverStep: CartPopoverStep
  setCartPopoverStep: React.Dispatch<React.SetStateAction<CartPopoverStep>>
}

type Props = {
  open: boolean
  children: (props: ChildrenProps) => ReactNode
}

export const CartPopoverRenderer: FC<Props> = ({ open, children }) => {
  const [cartPopoverStep, setCartPopoverStep] = useState<CartPopoverStep>(
    CartPopoverStep.Idle
  )
  const client = useReservoirClient()
  const [hasEnoughCurrency, setHasEnoughCurrency] = useState(true)
  const { data, clear, clearTransaction, validate, remove, add, checkout } =
    useCart((cart) => cart)
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
  const blockExplorerBaseUrl =
    chain?.blockExplorers?.default?.url || 'https://etherscan.io'

  useEffect(() => {
    if (open) {
      validate()
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
          previousPrice.amount?.decimal !== price?.amount?.decimal
      ),
    [items]
  )
  const { address } = useAccount()
  const { data: balance } = useBalance({
    chainId: cartChain?.id || client?.currentChain()?.id,
    address: address,
    token:
      currency?.address !== zeroAddress
        ? (currency?.address as UseBalanceToken)
        : undefined,
    watch: open,
    formatUnits: currency?.decimals,
  })

  useEffect(() => {
    if (balance) {
      if (!balance.value) {
        setHasEnoughCurrency(false)
      } else if (BigInt(balance.value) < totalPriceRaw) {
        setHasEnoughCurrency(false)
      } else {
        setHasEnoughCurrency(true)
      }
    }
  }, [totalPriceRaw, balance, currency])

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
        balance: balance?.value,
        transaction,
        blockExplorerBaseUrl,
        cartChain,
        checkout,
        clear,
        remove,
        add,
        validate,
        cartPopoverStep,
        setCartPopoverStep,
      })}
    </>
  )
}

export default CartPopoverRenderer
