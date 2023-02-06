import { useCoinConversion, useCart, useChainCurrency } from '../../hooks'
import React, { FC, ReactNode, useEffect, useMemo, useState } from 'react'
import { useAccount, useBalance, useNetwork } from 'wagmi'
import { BigNumber, constants, utils } from 'ethers'
import { UseBalanceToken } from '../../types/wagmi'
import { toFixed } from '../../lib/numbers'
import {
  Cart,
  CheckoutStatus,
  CheckoutTransactionError,
} from '../../context/CartProvider'

type ChildrenProps = {
  loading: boolean
  currency?: NonNullable<Cart['items'][0]['price']>['currency']
  totalPrice: number
  referrerFee?: number
  usdPrice: ReturnType<typeof useCoinConversion>
  balance?: BigNumber
  hasEnoughCurrency: boolean
  items: Cart['items']
  flaggedItems: Cart['items']
  unavailableItems: Cart['items']
  priceChangeItems: Cart['items']
  transaction?: Cart['transaction']
  blockExplorerBaseUrl: string
  checkout: ReturnType<typeof useCart>['checkout']
  clear: ReturnType<typeof useCart>['clear']
  remove: ReturnType<typeof useCart>['remove']
  add: ReturnType<typeof useCart>['add']
  validate: ReturnType<typeof useCart>['validate']
}

type Props = {
  open: boolean
  children: (props: ChildrenProps) => ReactNode
}

export const CartPopoverRenderer: FC<Props> = ({ open, children }) => {
  const chainCurrency = useChainCurrency()
  const [hasEnoughCurrency, setHasEnoughCurrency] = useState(true)
  const { data, clear, clearTransaction, validate, remove, add, checkout } =
    useCart((cart) => cart)
  const {
    isValidating,
    totalPrice,
    items,
    currency,
    transaction,
    referrerFee,
  } = data
  const usdPrice = useCoinConversion(
    open ? 'USD' : undefined,
    currency?.symbol || chainCurrency.name
  )
  const { chain: activeChain } = useNetwork()
  const blockExplorerBaseUrl =
    activeChain?.blockExplorers?.default?.url || 'https://etherscan.io'

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

  const flaggedItems = useMemo(
    () => items.filter((item) => item.isBannedOnOpensea),
    [items]
  )
  const unavailableItems = useMemo(
    () => items.filter((item) => !item.price),
    [items]
  )
  const priceChangeItems = useMemo(
    () =>
      items.filter(
        ({ previousPrice, price }) =>
          previousPrice &&
          previousPrice.amount?.decimal !== price?.amount?.decimal
      ),
    [items]
  )
  const { address } = useAccount()
  const { data: balance } = useBalance({
    address: address,
    token:
      currency?.contract !== constants.AddressZero
        ? (currency?.contract as UseBalanceToken)
        : undefined,
    watch: open,
    formatUnits: currency?.decimals,
  })

  useEffect(() => {
    if (balance) {
      const totalPriceTruncated = toFixed(totalPrice, currency?.decimals || 18)
      if (!balance.value) {
        setHasEnoughCurrency(false)
      } else if (
        balance.value.lt(
          utils.parseUnits(`${totalPriceTruncated}`, currency?.decimals)
        )
      ) {
        setHasEnoughCurrency(false)
      } else {
        setHasEnoughCurrency(true)
      }
    }
  }, [totalPrice, balance, currency])

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
        flaggedItems,
        unavailableItems,
        priceChangeItems,
        currency,
        totalPrice,
        referrerFee,
        usdPrice,
        hasEnoughCurrency,
        balance: balance?.value,
        transaction,
        blockExplorerBaseUrl,
        checkout,
        clear,
        remove,
        add,
        validate,
      })}
    </>
  )
}

export default CartPopoverRenderer
