import { useCoinConversion, useFallbackState, useCart } from '../../hooks'
import { keyframes, styled } from '../../../stitches.config'
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
  FC,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
} from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClose } from '@fortawesome/free-solid-svg-icons'
import { ProviderOptionsContext } from '../../ReservoirKitProvider'
import ReservoirLogoWhiteText from '../../img/ReservoirLogoWhiteText'
import CartItem from './CartItem'
import CartToast from './CartToast'

type Props = {
  trigger: ReactNode
  side?: ComponentPropsWithRef<typeof Popover>['side']
  openState?: [boolean, Dispatch<SetStateAction<boolean>>]
}

const scaleUp = keyframes({
  '0%': { opacity: 0, transform: 'scale(0.9) translateY(-10px)' },
  '100%': { opacity: 1, transform: 'scale(1) translateY(0)' },
})

const scaleDown = keyframes({
  '0%': { opacity: 1, transform: 'scale(1) translateY(0)' },
  '100%': { opacity: 0, transform: 'scale(0.9) translateY(-10px)' },
})

const Logo = styled(ReservoirLogoWhiteText, {
  '& .letter': {
    fill: '$reservoirLogoColor',
  },
})

const CartPopover: FC<Props> = ({ trigger, side, openState }) => {
  const [open, setOpen] = useFallbackState(
    openState ? openState[0] : false,
    openState
  )
  const providerOptionsContext = useContext(ProviderOptionsContext)
  const { data: items, clear, validate } = useCart((cart) => cart.items)
  const { data: isValidating } = useCart((cart) => cart.isValidating)
  const currency =
    items.length > 0 && items[0].price?.currency
      ? items[0].price.currency
      : undefined
  const usdConversion = useCoinConversion(
    open ? 'USD' : undefined,
    currency?.symbol
  )

  useEffect(() => {
    if (open) {
      validate()
    }
  }, [open])

  const totalPrice = items.reduce(
    (total, { price }) => (total += price?.amount?.decimal || 0),
    0
  )

  return (
    <Popover.Root modal={true} open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        asChild
        style={{
          backgroundColor: 'transparent',
          borderWidth: 0,
          cursor: 'pointer',
          padding: 0,
        }}
      >
        {trigger}
      </Popover.Trigger>
      <Popover.Content side={side} sideOffset={8} css={{ zIndex: 1001 }}>
        <Flex
          css={{
            borderRadius: '$borderRadius',
            $$shadowColor: '$colors$gray7',
            boxShadow: 'box-shadow: 0px 2px 16px $$shadowColor',
            border: '1px solid $borderColor',
            p: 24,
            overflowY: 'auto',
            height: 700,
            width: 395,
            backgroundColor: '$contentBackground',
            transformOrigin: 'var(--radix-popover-content-transform-origin)',
            animation: `${open ? scaleUp : scaleDown} 0.2s ease-in-out`,
          }}
          direction="column"
        >
          {isValidating && (
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
            {items.length > 0 && (
              <Flex
                align="center"
                justify="center"
                css={{
                  background: '$accentBgActive',
                  height: 20,
                  width: 20,
                  borderRadius: '99999px',
                  ml: '$2',
                }}
              >
                <Text style="subtitle2">{items.length}</Text>
              </Flex>
            )}
            {items.length > 0 && (
              <Text
                style="subtitle2"
                color="accent"
                css={{
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
          {/* <CartToast
            kind="error"
            message="Transaction failed, items no longer available"
            link={{ text: 'Test', url: 'https://google.com' }}
          /> */}
          <Flex
            direction="column"
            css={{ gap: '$4', mb: '$4', overflowY: 'auto', mx: -24 }}
          >
            {items.map((item) => (
              <CartItem
                key={`${item.collection.id}:${item.token.id}`}
                item={item}
                usdConversion={usdConversion}
              />
            ))}
          </Flex>
          <Flex direction="column" css={{ mt: 'auto', pb: 10 }}>
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
                  logoWidth={18}
                />
                {usdConversion && (
                  <FormatCurrency
                    amount={usdConversion * totalPrice}
                    style="subtitle2"
                    color="subtle"
                  />
                )}
              </Flex>
            </Flex>

            <Text
              style="body2"
              color="subtle"
              css={{ mb: '$2', textAlign: 'center' }}
            >
              Please confirm purchase in your wallet{' '}
            </Text>
            <Button>Select Items to Buy</Button>
            {!providerOptionsContext.disablePoweredByReservoir && (
              <Flex
                css={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  visibility: '$poweredByReservoirVisibility',
                  mt: 26,
                }}
              >
                <Anchor href="https://reservoir.tools/" target="_blank">
                  <Text
                    style="body2"
                    color="subtle"
                    css={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    Powered by <Logo />
                  </Text>
                </Anchor>
              </Flex>
            )}
          </Flex>
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
}

export default CartPopover
