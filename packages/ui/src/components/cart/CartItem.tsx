import React, { FC } from 'react'
import { useCart, useReservoirClient } from '../../hooks'
import {
  Button,
  Flex,
  FormatCryptoCurrency,
  FormatCurrency,
  Text,
} from '../../primitives'
import { styled } from '../../../stitches.config'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowDown,
  faArrowUp,
  faClose,
} from '@fortawesome/free-solid-svg-icons'
import { Cart } from '../../context/CartProvider'
import { formatNumber } from '../../lib/numbers'
import QuantitySelector from '../../modal/QuantitySelector'
import * as allChains from 'viem/chains'
import { customChains } from '@reservoir0x/reservoir-sdk'

type Props = {
  item: Cart['items'][0]
  usdConversion: number | null
  tokenUrl?: string
}

const CartItemImage = styled('img', {
  width: 56,
  height: 56,
  borderRadius: 4,
  objectFit: 'cover',
})

const CloseButton = styled(Button, {
  position: 'absolute',
  width: 24,
  height: 24,
  top: -8,
  right: -8,
  flexShrink: 0,
  defaultVariants: {
    size: 'none',
    corners: 'circle',
  },
})

const CartItem: FC<Props> = ({ item, usdConversion, tokenUrl }) => {
  const { token, collection, order } = item
  const contract = collection.id.split(':')[0]
  const client = useReservoirClient()
  const {
    remove,
    data: cartCurrency,
    setQuantity,
  } = useCart((cart) => cart.currency)
  const { data: cartChain } = useCart((cart) => cart.chain)

  const currencyConverted =
    item.price && item.price?.currency?.contract !== cartCurrency?.contract
  let price = currencyConverted
    ? item.price?.amount?.native
    : item.price?.amount?.decimal
  let previousPrice =
    item.previousPrice?.currency?.contract !== cartCurrency?.contract
      ? item.previousPrice?.amount?.native
      : item.previousPrice?.amount?.decimal
  let priceDiff = 0
  let priceIncrease = false
  let priceDecrease = false
  if (price !== undefined && previousPrice !== undefined) {
    priceDiff = Math.abs(((price - previousPrice) / price) * 100)
    priceIncrease = price > previousPrice
    priceDecrease = price < previousPrice
  }
  let usdPrice = (usdConversion || 0) * (price || 0)
  const reservoirChain = client?.chains.find(
    (chain) => cartChain?.id === chain.id
  )

  if (price && order?.quantity) {
    price = price * order.quantity
    usdPrice = usdPrice * order.quantity
  }

  return (
    <Flex
      direction="column"
      css={{
        transition: 'background-color 0.25s ease-in-out',
        '&:hover': {
          backgroundColor: '$neutralBgHover',
        },
      }}
    >
      <Flex
        onClick={() => {
          let chain = Object.values(allChains).find(
            (chain) => cartChain?.id === chain.id
          )

          if (!chain) {
            chain = Object.values(customChains).find(
              (chain) => chain.id === (reservoirChain?.id || 1)
            )
          }

          let url: string | undefined = tokenUrl
          if (!url && cartChain) {
            let tokenMetaKey: string | null = null
            if (cartChain.id === allChains.mainnet.id) {
              tokenMetaKey = 'reservoir:token-url-mainnet'
            } else {
              tokenMetaKey = `reservoir:token-url-${chain?.name.toLowerCase()}`
            }
            const tokenMetaTag = document.querySelector(
              `meta[property='${tokenMetaKey}']`
            )
            if (tokenMetaTag) {
              url = tokenMetaTag.getAttribute('content') || undefined
            }
          }
          if (url) {
            window.location.href = url
              .replace('${contract}', contract)
              .replace('${tokenId}', token.id)
          }
        }}
        css={{
          width: '100%',
          px: 24,
          py: 8,
          cursor: 'pointer',
        }}
      >
        <Flex css={{ position: 'relative', minWidth: 0, flexShrink: 0 }}>
          <CartItemImage
            src={`${reservoirChain?.baseApiUrl}/redirect/tokens/${contract}:${token.id}/image/v1?imageSize=small`}
            css={!price ? { filter: 'grayscale(1)' } : {}}
            onError={({ currentTarget }) => {
              const collectionImage = `${reservoirChain?.baseApiUrl}/redirect/collections/${collection.id}/image/v1`
              if (currentTarget.src != collectionImage) {
                currentTarget.src = collectionImage
              }
            }}
          />
          <CloseButton
            css={{
              '&:hover': {
                background: '$errorAccent',
              },
              background: !item.price ? '$errorAccent' : '$neutralSolid',
            }}
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              if (order?.id) {
                remove([order?.id])
              } else {
                remove([`${collection.id}:${token.id}`])
              }
            }}
          >
            <FontAwesomeIcon icon={faClose} width="16" height="16" />
          </CloseButton>
        </Flex>
        <Flex
          direction="column"
          justify="center"
          css={{ gap: 2, ml: '$2', minWidth: 0 }}
        >
          <Flex align="center" css={{ gap: '$1' }}>
            <Text style="h6" color={price ? undefined : 'subtle'} ellipsify>
              {token.name ? token.name : `#${token.id}`}
            </Text>
          </Flex>
          <Text style="body3" color="subtle" ellipsify>
            {collection.name}
          </Text>
          {!price && !order?.id && (
            <Text style="body3" color="error">
              Item no longer available
            </Text>
          )}
          {!price && order?.id && (
            <Text style="body3" color="error">
              Listing no longer available
            </Text>
          )}
          {!priceIncrease && !priceDecrease && currencyConverted && (
            <Flex
              css={{ gap: '$1', color: '$accentSolidHover' }}
              align="center"
            >
              <Text style="body3" color="accent">
                Currency converted
              </Text>
            </Flex>
          )}
          {priceIncrease && (
            <Flex
              css={{ gap: '$1', color: '$accentSolidHover' }}
              align="center"
            >
              <FontAwesomeIcon width="11" icon={faArrowUp} />
              <Text style="body2" color="accent">
                Price has gone up {formatNumber(priceDiff)}%
              </Text>
            </Flex>
          )}
          {priceDecrease && (
            <Flex
              css={{ gap: '$1', color: '$accentSolidHover' }}
              align="center"
            >
              <FontAwesomeIcon width="11" icon={faArrowDown} />
              <Text style="body3" color="accent">
                Price went down {formatNumber(priceDiff)}%
              </Text>
            </Flex>
          )}
        </Flex>
        {price ? (
          <Flex
            direction="column"
            justify="center"
            css={{
              ml: 'auto',
              flexShrink: 0,
              gap: '$1',
              '> div': { ml: 'auto' },
            }}
          >
            <FormatCryptoCurrency
              textStyle="subtitle2"
              amount={price}
              address={cartCurrency?.contract}
              decimals={cartCurrency?.decimals}
              symbol={cartCurrency?.symbol}
              logoWidth={12}
              chainId={cartChain?.id}
            />
            {usdPrice && usdPrice > 0 ? (
              <FormatCurrency
                amount={usdPrice}
                style="tiny"
                color="subtle"
                css={{ textAlign: 'end' }}
              />
            ) : null}
          </Flex>
        ) : null}
      </Flex>
      {order && order?.quantityRemaining > 1 && price ? (
        <Flex
          justify="between"
          align="center"
          css={{ width: '100%', px: 24, pb: 8, gap: '$3' }}
        >
          <Flex
            direction="column"
            align="start"
            css={{ gap: '$1', overflow: 'hidden', minWidth: 0 }}
          >
            <Text style="body3">Quantity</Text>
            <Text
              style="body3"
              color="subtle"
              ellipsify
              css={{ width: '100%' }}
            >
              {formatNumber(order.quantityRemaining)} items available
            </Text>
          </Flex>
          <QuantitySelector
            min={1}
            max={order.quantityRemaining as number}
            quantity={order.quantity}
            setQuantity={(number) => setQuantity(order.id, number)}
            css={{
              border: '1px solid $neutralBorder',
              background: 'none',
            }}
          />
        </Flex>
      ) : null}
    </Flex>
  )
}

export default CartItem
