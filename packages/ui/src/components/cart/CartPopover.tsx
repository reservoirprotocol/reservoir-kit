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
  ChainIcon,
  CryptoCurrencyIcon,
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
  faChevronRight,
  faChevronLeft,
  faClose,
  faLock,
  faRefresh,
  faShoppingCart,
} from '@fortawesome/free-solid-svg-icons'
import { ProviderOptionsContext } from '../../ReservoirKitProvider'
import CartItem from './CartItem'
import CartToast from './CartToast'
import CartPopoverRenderer, { CartPopoverStep } from './CartPopoverRenderer'
import {
  CheckoutStatus,
  CheckoutTransactionError,
} from '../../context/CartProvider'
import { useAccount } from 'wagmi'
import { CartCheckoutModal } from './CartCheckoutModal'
import { Logo } from '../../modal/Modal'
import { truncateAddress } from '../../lib/truncate'
import { SelectPaymentToken } from '../../modal/SelectPaymentToken'
import getChainBlockExplorerUrl from '../../lib/getChainBlockExplorerUrl'

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
        totalPriceRaw,
        feeOnTop,
        feeOnTopRaw,
        usdPrice,
        hasEnoughCurrency,
        balance,
        currency,
        transaction,
        blockExplorerBaseUrl,
        cartChain,
        cartPopoverStep,
        paymentTokens,
        setCartPopoverStep,
        setCurrency,
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
            <Popover.Portal>
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
                  p: '$4',
                  minHeight: 500,
                  width: 395,
                  maxHeight: `calc(100vh - ${
                    triggerBottom || 0
                  }px - (25px * 2) - 10px)`,
                  backgroundColor: '$contentBackground',
                  boxSizing: 'border-box',
                  '@media(max-width: 520px)': {
                    height: `calc(100vh - ${
                      triggerBottom || 0
                    }px - (25px * 2))`,
                    width: '100vw',
                    minHeight: '100%',
                  },
                }}
                onPointerDownOutside={(e) => {
                  const dismissableLayers = Array.from(
                    document.querySelectorAll('div[data-radix-dismissable]')
                  )
                  const clickedDismissableLayer = dismissableLayers.some((el) =>
                    e.target ? el.contains(e.target as Node) : false
                  )

                  if (
                    !clickedDismissableLayer &&
                    dismissableLayers.length > 0
                  ) {
                    e.preventDefault()
                  }
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
                    <>
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
                        <Text style="subtitle3" color="button">
                          {items.length}
                        </Text>
                      </Flex>
                      <Text
                        style="subtitle3"
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
                    </>
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
                {cartPopoverStep === CartPopoverStep.Idle && (
                  <>
                    <Flex align="center" css={{ mb: '$4' }}>
                      <ChainIcon
                        chainId={cartChain?.id}
                        height={12}
                        css={{ mr: 5 }}
                      />
                      <Text style="body3" color="subtle">
                        {cartChain?.name}
                      </Text>
                    </Flex>
                    {unavailableItems.length > 0 && (
                      <CartToast
                        kind="error"
                        message={`${unavailableItems.length} ${unavailableItemsSubject} no longer available`}
                        link={
                          <Text
                            color="accent"
                            style="subtitle3"
                            css={{ ml: 'auto', mt: 3, cursor: 'pointer' }}
                            onClick={(e) => {
                              e.preventDefault()
                              remove(
                                unavailableItems.map(
                                  (item) =>
                                    `${item.collection.id}:${item.token.id}`
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
                    {purchaseComplete
                      ? transaction?.txHashes?.map((hash) => {
                          const truncatedTxHash = truncateAddress(hash.txHash)
                          const blockExplorerBaseUrl = getChainBlockExplorerUrl(
                            hash.chainId
                          )
                          return (
                            <CartToast
                              message={`Transaction Complete`}
                              link={
                                <Anchor
                                  href={`${blockExplorerBaseUrl}/tx/${hash.txHash}`}
                                  target="_blank"
                                  css={{ ml: 'auto', fontSize: 12, mt: 2 }}
                                  weight="medium"
                                  color="primary"
                                >
                                  View transaction: {truncatedTxHash}
                                </Anchor>
                              }
                            />
                          )
                        })
                      : null}
                    {!isCartEmpty && (
                      <Flex
                        direction="column"
                        css={{
                          gap: '$4',
                          mb: '$4',
                          overflowY: 'auto',
                          mx: -16,
                        }}
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
                          css={{
                            color: '$neutralBorderHover',
                            flex: 1,
                            gap: '$5',
                          }}
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
                          <Text style="subtitle3">Referrer Fee</Text>
                          <Flex
                            direction="column"
                            justify="center"
                            css={{
                              ml: 'auto',
                              gap: '$1',
                              '> div': { ml: 'auto' },
                            }}
                          >
                            <FormatCryptoCurrency
                              textStyle="subtitle3"
                              amount={feeOnTop}
                              address={currency?.address}
                              decimals={currency?.decimals}
                              symbol={currency?.symbol}
                              logoWidth={12}
                              chainId={cartChain?.id}
                            />
                            {usdPrice ? (
                              <FormatCurrency
                                amount={usdPrice * feeOnTop}
                                style="subtitle3"
                                color="subtle"
                                css={{ textAlign: 'end' }}
                              />
                            ) : null}
                          </Flex>
                        </Flex>
                      ) : null}
                      {!isCartEmpty && isConnected && (
                        <>
                          <Flex
                            direction="column"
                            css={{
                              gap: '$2',
                              py: '$3',
                              px: '$4',
                              borderRadius: '$3',
                              mx: -16,
                              mb: '$4',
                              cursor: 'pointer',
                              '&:hover': {
                                backgroundColor: '$neutralBgHover',
                              },
                            }}
                            onClick={() =>
                              setCartPopoverStep(CartPopoverStep.SelectPayment)
                            }
                          >
                            <Flex
                              justify="between"
                              align="center"
                              css={{
                                gap: '$1',
                              }}
                            >
                              <Text style="subtitle2">Payment Method</Text>
                              <Flex align="center" css={{ gap: '$2' }}>
                                <Flex align="center">
                                  <CryptoCurrencyIcon
                                    address={currency?.address as string}
                                    css={{ width: 16, height: 16, mr: '$1' }}
                                    chainId={currency?.chainId}
                                  />
                                  <Text style="subtitle2">
                                    {currency?.symbol}
                                  </Text>
                                </Flex>
                                <Box css={{ color: '$neutralSolidHover' }}>
                                  <FontAwesomeIcon
                                    icon={faChevronRight}
                                    width={10}
                                  />
                                </Box>
                              </Flex>
                            </Flex>
                          </Flex>
                          <Flex css={{ mb: 28 }}>
                            <Text style="h6">You Pay</Text>
                            <Flex
                              direction="column"
                              justify="center"
                              css={{
                                ml: 'auto',
                                gap: '$1',
                                '> div': { ml: 'auto' },
                              }}
                            >
                              {providerOptionsContext.preferDisplayFiatTotal ? (
                                <>
                                  {currency?.usdTotalPriceRaw ? (
                                    <FormatCurrency
                                      amount={currency?.usdTotalPriceRaw}
                                      style="h6"
                                      color="base"
                                      css={{ textAlign: 'end' }}
                                    />
                                  ) : null}
                                  <FormatCryptoCurrency
                                    textStyle="subtitle3"
                                    textColor="subtle"
                                    amount={totalPriceRaw}
                                    address={currency?.address}
                                    decimals={currency?.decimals}
                                    symbol={currency?.symbol}
                                    logoWidth={12}
                                    chainId={cartChain?.id}
                                  />
                                </>
                              ) : (
                                <>
                                  <FormatCryptoCurrency
                                    textStyle="h6"
                                    amount={totalPriceRaw}
                                    address={currency?.address}
                                    decimals={currency?.decimals}
                                    symbol={currency?.symbol}
                                    logoWidth={18}
                                    chainId={cartChain?.id}
                                  />
                                  {currency?.usdTotalPriceRaw && (
                                    <FormatCurrency
                                      amount={currency?.usdTotalPriceRaw}
                                      style="subtitle3"
                                      color="subtle"
                                      css={{ textAlign: 'end' }}
                                    />
                                  )}
                                </>
                              )}
                            </Flex>
                          </Flex>
                        </>
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
                            chainId={cartChain?.id}
                            amount={balance}
                            address={currency?.address}
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
                                if (document.body.style) {
                                  document.body.style.pointerEvents = 'auto'
                                }
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
                            {isConnected
                              ? hasEnoughCurrency
                                ? 'Purchase'
                                : 'Add Funds to Purchase'
                              : 'Connect'}
                          </Button>
                        )}
                      {!isCartEmpty && !hasValidItems && (
                        <Button
                          color="secondary"
                          onClick={() => {
                            clear()
                          }}
                        >
                          <FontAwesomeIcon
                            icon={faRefresh}
                            width="16"
                            height="16"
                          />
                          Refresh Cart
                        </Button>
                      )}
                    </Flex>
                  </>
                )}
                {cartPopoverStep === CartPopoverStep.SelectPayment && (
                  <>
                    <Flex
                      css={{ gap: '$4', cursor: 'pointer' }}
                      onClick={() => {
                        setCartPopoverStep(CartPopoverStep.Idle)
                      }}
                    >
                      <Box css={{ color: '$neutralSolidHover' }}>
                        <FontAwesomeIcon icon={faChevronLeft} width={10} />
                      </Box>
                      <Text style="subtitle2">Select A Token</Text>
                    </Flex>
                    <SelectPaymentToken
                      paymentTokens={paymentTokens}
                      currency={currency}
                      itemAmount={items.length}
                      setCurrency={setCurrency}
                      goBack={() => setCartPopoverStep(CartPopoverStep.Idle)}
                      css={{
                        padding: 0,
                        ml: '-16px',
                        mt: '$4',
                        width: 'calc(100% + 16px)',
                        mb: 'auto',
                      }}
                    />
                  </>
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
              </Popover.Content>
            </Popover.Portal>
            <Popover.Portal>
              {open && (
                <Box
                  css={{
                    backgroundColor: '$overlayBackground',
                    position: 'fixed',
                    inset: 0,
                    zIndex: 1000,
                    pointerEvents: 'all',
                  }}
                  data-radix-dismissable
                ></Box>
              )}
            </Popover.Portal>
          </Popover.Root>
        )
      }}
    </CartPopoverRenderer>
  )
}

CartPopover.Custom = CartPopoverRenderer

export default CartPopover
