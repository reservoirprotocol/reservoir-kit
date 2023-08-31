import { useFallbackState } from '../../hooks'
import { keyframes } from '../../../stitches.config'
import {
  Box,
  Flex,
  Text,
  Button,
  Anchor,
  FormatCryptoCurrency,
  FormatCurrency,
  Loader,
} from '../../primitives'
import Popover from '../../primitives/Popover'
import React, {
  ComponentPropsWithRef,
  Dispatch,
  ReactElement,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faClose,
  faLock,
  faRefresh,
  faShoppingCart,
} from '@fortawesome/free-solid-svg-icons'
import { ProviderOptionsContext } from '../../ReservoirKitProvider'
import CartItem from './CartItem'
import CartToast from './CartToast'
import CartPopoverRenderer from './CartPopoverRenderer'
import {
  CheckoutStatus,
  CheckoutTransactionError,
} from '../../context/CartProvider'
import { useAccount } from 'wagmi'
import { CartCheckoutModal } from './CartCheckoutModal'
import { Logo } from '../../modal/Modal'

const scaleUp = keyframes({
  '0%': { opacity: 0, transform: 'scale(0.9) translateY(-10px)' },
  '100%': { opacity: 1, transform: 'scale(1) translateY(0)' },
})

const scaleDown = keyframes({
  '0%': { opacity: 1, transform: 'scale(1) translateY(0)' },
  '100%': { opacity: 0, transform: 'scale(0.9) translateY(-10px)' },
})

type Props = {
  trigger: ReactNode
  side?: ComponentPropsWithRef<typeof Popover>['side']
  openState?: [boolean, Dispatch<SetStateAction<boolean>>]
  tokenUrl?: string
  onConnectWallet: () => void
}

const CONTENT_OFFSET = 8

export function CartPopover({
  trigger,
  side,
  openState,
  tokenUrl,
  onConnectWallet,
}: Props): ReactElement {
  const [popoverTrigger, setPopoverTrigger] =
    useState<HTMLButtonElement | null>(null)
  const [open, setOpen] = useFallbackState(
    openState ? openState[0] : false,
    openState
  )
  const providerOptionsContext = useContext(ProviderOptionsContext)
  const [displayPendingTransaction, setDisplayPendingTransaction] =
    useState(false)
  const [purchaseComplete, setPurchaseComplete] = useState(false)
  const { isConnected } = useAccount()

  useEffect(() => {
    if (!open) {
      setDisplayPendingTransaction(false)
      setPurchaseComplete(false)
    }
  }, [open])

  const triggerBottom = useMemo(
    () =>
      (popoverTrigger?.offsetTop || 0) +
      (popoverTrigger?.offsetHeight || 0) +
      CONTENT_OFFSET,
    [trigger]
  )

  return (
    <CartPopoverRenderer open={open}>
      {({
        loading,
        items,
        unavailableItems,
        priceChangeItems,
        totalPrice,
        feeOnTop,
        usdPrice,
        hasEnoughCurrency,
        balance,
        currency,
        cartCurrencyConverted,
        transaction,
        blockExplorerBaseUrl,
        cartChain,
        remove,
        clear,
        checkout,
      }) => {
        useEffect(() => {
          if (transaction?.status === CheckoutStatus.Complete) {
            setDisplayPendingTransaction(false)
            setPurchaseComplete(true)
          }
        }, [transaction?.status])

        const unavailableItemsSubject =
          unavailableItems.length > 1 ? 'items' : 'item'
        const priceChangeItemsSubject =
          priceChangeItems.length > 1 ? 'items prices' : 'item price'
        const isCartEmpty = items.length === 0
        const hasValidItems = items.length > unavailableItems.length

        return (
          <Popover.Root modal={true} open={open} onOpenChange={setOpen}>
            <Popover.Trigger asChild ref={setPopoverTrigger}>
              {trigger}
            </Popover.Trigger>
            <Popover.Content
              side={side}
              sideOffset={CONTENT_OFFSET}
              css={{
                display: 'flex',
                flexDirection: 'column',
                zIndex: 1001,
                transformOrigin:
                  'var(--radix-popover-content-transform-origin)',
                animation: `${open ? scaleUp : scaleDown} 0.2s ease-in-out`,
                overflowY: 'auto',
                borderRadius: '$borderRadius',
                $$shadowColor: '$colors$gray7',
                boxShadow: 'box-shadow: 0px 2px 16px $$shadowColor',
                border: '1px solid $borderColor',
                p: 24,
                minHeight: 500,
                width: 395,
                maxHeight: `calc(100vh - ${
                  triggerBottom || 0
                }px - (25px * 2) - 10px)`,
                backgroundColor: '$contentBackground',
                boxSizing: 'border-box',
                '@media(max-width: 520px)': {
                  height: `calc(100vh - ${triggerBottom || 0}px - (25px * 2))`,
                  width: '100vw',
                  minHeight: '100%',
                },
              }}
            >
              {loading && (
                <Loader
                  css={{
                    backgroundColor: '$contentBackground',
                    position: 'absolute',
                    inset: 0,
                    opacity: 0.6,
                    zIndex: 10000,
                  }}
                />
              )}
              <Flex align="center" css={{ mb: '$4' }}>
                <Text style="h6">Cart</Text>
                {!isCartEmpty && (
                  <Flex
                    align="center"
                    justify="center"
                    css={{
                      background: '$accentSolid',
                      height: 20,
                      width: 20,
                      borderRadius: '99999px',
                      ml: '$2',
                    }}
                  >
                    <Text style="subtitle2" color="button">
                      {items.length}
                    </Text>
                  </Flex>
                )}
                {!isCartEmpty && (
                  <Text
                    style="subtitle2"
                    css={{
                      color: '$accentSolid',
                      cursor: 'pointer',
                      ml: 24,
                      '&:hover': { color: '$accentSolidHover' },
                    }}
                    onClick={clear}
                  >
                    Clear All
                  </Text>
                )}
                <Button
                  size="none"
                  color="ghost"
                  css={{ color: '$neutralSolid', ml: 'auto' }}
                  onClick={() => {
                    setOpen(false)
                  }}
                >
                  <FontAwesomeIcon icon={faClose} width="16" height="16" />
                </Button>
              </Flex>
              {cartCurrencyConverted && (
                <CartToast
                  kind="warning"
                  message={`Mixed currency items are only available to be checked out with ${currency?.symbol}`}
                />
              )}
              {unavailableItems.length > 0 && (
                <CartToast
                  kind="error"
                  message={`${unavailableItems.length} ${unavailableItemsSubject} no longer available`}
                  link={
                    <Text
                      color="accent"
                      style="subtitle2"
                      css={{ ml: 'auto', mt: 3, cursor: 'pointer' }}
                      onClick={(e) => {
                        e.preventDefault()
                        remove(
                          unavailableItems.map(
                            (item) => `${item.collection.id}:${item.token.id}`
                          )
                        )
                      }}
                    >
                      Remove {unavailableItemsSubject}
                    </Text>
                  }
                />
              )}
              {priceChangeItems.length > 0 && (
                <CartToast
                  kind="warning"
                  message={`${priceChangeItems.length} ${priceChangeItemsSubject} updated`}
                />
              )}
              {transaction?.error && (
                <CartToast
                  kind="error"
                  message={
                    transaction.errorType ===
                    CheckoutTransactionError.UserDenied
                      ? 'User denied transaction signature.'
                      : transaction.error.message
                  }
                />
              )}
              {purchaseComplete && (
                <CartToast
                  message={`Transaction Complete`}
                  link={
                    <Anchor
                      href={`${blockExplorerBaseUrl}/tx/${transaction?.txHash}`}
                      target="_blank"
                      css={{ ml: 'auto', fontSize: 12, mt: 2 }}
                      weight="medium"
                      color="primary"
                    >
                      Etherscan
                    </Anchor>
                  }
                />
              )}
              {!isCartEmpty && (
                <Flex
                  direction="column"
                  css={{ gap: '$4', mb: '$4', overflowY: 'auto', mx: -24 }}
                >
                  {items.map((item) => (
                    <CartItem
                      key={`${item.collection.id}:${item.token.id}`}
                      item={item}
                      usdConversion={usdPrice}
                      tokenUrl={tokenUrl}
                    />
                  ))}
                </Flex>
              )}
              {isCartEmpty &&
                !(
                  displayPendingTransaction &&
                  transaction?.status === CheckoutStatus.Finalizing
                ) && (
                  <Flex
                    direction="column"
                    align="center"
                    justify="center"
                    css={{ color: '$neutralBorderHover', flex: 1, gap: '$5' }}
                  >
                    <FontAwesomeIcon
                      icon={faShoppingCart}
                      width="30"
                      height="30"
                      style={{ height: 30 }}
                    />
                    <Text style="body2" color="subtle">
                      No items in your cart
                    </Text>
                  </Flex>
                )}
              <Flex direction="column" css={{ mt: 'auto', pb: 10 }}>
                {!isCartEmpty && feeOnTop ? (
                  <Flex css={{ mb: '$4' }}>
                    <Text style="subtitle2">Referrer Fee</Text>
                    <Flex
                      direction="column"
                      justify="center"
                      css={{ ml: 'auto', gap: '$1', '> div': { ml: 'auto' } }}
                    >
                      <FormatCryptoCurrency
                        textStyle="subtitle2"
                        amount={feeOnTop}
                        address={currency?.contract}
                        decimals={currency?.decimals}
                        symbol={currency?.symbol}
                        logoWidth={12}
                        chainId={cartChain?.id}
                      />
                      {usdPrice && (
                        <FormatCurrency
                          amount={usdPrice * feeOnTop}
                          style="subtitle2"
                          color="subtle"
                          css={{ textAlign: 'end' }}
                        />
                      )}
                    </Flex>
                  </Flex>
                ) : null}
                {!isCartEmpty && (
                  <Flex css={{ mb: 28 }}>
                    <Text style="h6">Total</Text>
                    <Flex
                      direction="column"
                      justify="center"
                      css={{ ml: 'auto', gap: '$1', '> div': { ml: 'auto' } }}
                    >
                      <FormatCryptoCurrency
                        textStyle="h6"
                        amount={totalPrice}
                        address={currency?.contract}
                        decimals={currency?.decimals}
                        symbol={currency?.symbol}
                        logoWidth={18}
                        chainId={cartChain?.id}
                      />
                      {usdPrice && (
                        <FormatCurrency
                          amount={usdPrice * totalPrice}
                          style="subtitle2"
                          color="subtle"
                          css={{ textAlign: 'end' }}
                        />
                      )}
                    </Flex>
                  </Flex>
                )}
                <CartCheckoutModal
                  open={
                    (transaction?.status == CheckoutStatus.Approving ||
                      transaction?.status == CheckoutStatus.Finalizing ||
                      transaction?.status == CheckoutStatus.Complete) &&
                    !transaction?.error
                  }
                  items={items}
                  currency={currency}
                  totalPrice={totalPrice}
                  usdPrice={usdPrice || 0}
                  transaction={transaction}
                  cartChain={cartChain}
                  blockExplorerBaseUrl={blockExplorerBaseUrl}
                  setCartPopoverOpen={setOpen}
                />

                {!hasEnoughCurrency && isConnected && (
                  <Flex
                    align="center"
                    justify="center"
                    css={{ mb: '$2', gap: '$2' }}
                  >
                    <Text style="body3" color="error">
                      Insufficient balance
                    </Text>
                    <FormatCryptoCurrency
                      textStyle="body3"
                      amount={balance}
                      address={currency?.contract}
                      decimals={currency?.decimals}
                      symbol={currency?.symbol}
                      logoWidth={10}
                    />
                  </Flex>
                )}
                {isCartEmpty && !displayPendingTransaction && (
                  <Button disabled={true}>Select Items to Buy</Button>
                )}
                {!isCartEmpty &&
                  hasValidItems &&
                  (transaction?.status === CheckoutStatus.Idle ||
                    !displayPendingTransaction) && (
                    <Button
                      disabled={!hasEnoughCurrency && isConnected}
                      onClick={async () => {
                        if (!isConnected) {
                          onConnectWallet?.()
                        } else {
                          checkout()
                            .then(() => {
                              setDisplayPendingTransaction(true)
                            })
                            .catch((e) => {
                              console.error(e)
                              setDisplayPendingTransaction(false)
                            })
                        }
                      }}
                    >
                      {hasEnoughCurrency || !isConnected
                        ? 'Purchase'
                        : 'Add Funds to Purchase'}
                    </Button>
                  )}
                {!isCartEmpty && !hasValidItems && (
                  <Button
                    color="secondary"
                    onClick={() => {
                      clear()
                    }}
                  >
                    <FontAwesomeIcon icon={faRefresh} width="16" height="16" />
                    Refresh Cart
                  </Button>
                )}

                {!providerOptionsContext.disablePoweredByReservoir && (
                  <Flex
                    align="center"
                    css={{
                      mx: 'auto',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mt: 26,
                      gap: '$1',
                      visibility: '$poweredByReservoirVisibility',
                    }}
                  >
                    <Box css={{ color: '$neutralBorderHover' }}>
                      <FontAwesomeIcon icon={faLock} width={9} height={10} />
                    </Box>
                    <Text
                      style="tiny"
                      color="subtle"
                      css={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        lineHeight: '14px',
                        fontWeight: 400,
                        color: '$neutralText',
                      }}
                    >
                      Powered by{' '}
                      <Anchor
                        href="https://reservoir.tools/"
                        target="_blank"
                        weight="heavy"
                        color="gray"
                        css={{
                          height: 12,
                          fontSize: 12,
                          '&:hover': {
                            color: '$neutralSolid',
                            fill: '$neutralSolid',
                          },
                        }}
                      >
                        <Logo />
                      </Anchor>
                    </Text>
                  </Flex>
                )}
              </Flex>
            </Popover.Content>
            {open && (
              <Box
                css={{
                  backgroundColor: '$overlayBackground',
                  position: 'fixed',
                  inset: 0,
                  zIndex: 1000,
                }}
              ></Box>
            )}
          </Popover.Root>
        )
      }}
    </CartPopoverRenderer>
  )
}

CartPopover.Custom = CartPopoverRenderer

export default CartPopover
