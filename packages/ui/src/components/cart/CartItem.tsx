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
import InfoTooltip from '../../primitives/InfoTooltip'
import { formatNumber } from '../../lib/numbers'
import { mainnet } from 'wagmi'

type Props = {
  item: Cart['items'][0]
  usdConversion: number
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
  const { token, collection, isBannedOnOpensea } = item
  const contract = collection.id.split(':')[0]
  const client = useReservoirClient()
  const { remove, data: cartCurrency } = useCart((cart) => cart.currency)
  const { data: cartChain } = useCart((cart) => cart.chain)

  let price =
    item.price?.currency?.contract !== cartCurrency?.contract
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
  const usdPrice = (usdConversion || 0) * (price || 0)

  return (
    <Flex
      onClick={() => {
        let url: string | undefined = tokenUrl
        if (!url && cartChain) {
          let tokenMetaKey: string | null = null
          if (cartChain.id === mainnet.id) {
            tokenMetaKey = 'reservoir:token-url-mainnet'
          } else {
            tokenMetaKey = `reservoir:token-url-${cartChain.name.toLowerCase()}`
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
        transition: 'background-color 0.25s ease-in-out',
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: '$neutralBgHover',
          [`& ${CloseButton}`]: {
            background: '$errorAccent',
          },
        },
      }}
    >
      <Flex css={{ position: 'relative', minWidth: 0, flexShrink: 0 }}>
        <CartItemImage
          src={`${client?.apiBase}/redirect/tokens/${contract}:${token.id}/image/v1`}
          css={!price ? { filter: 'grayscale(1)' } : {}}
        />
        <CloseButton
          css={{
            background:
              item.isBannedOnOpensea || !item.price
                ? '$errorAccent'
                : '$neutralSolid',
          }}
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
            remove([`${collection.id}:${token.id}`])
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
          {isBannedOnOpensea && (
            <InfoTooltip
              side="bottom"
              width={200}
              content={'Item not tradeable on OpenSea'}
              kind="error"
            />
          )}
        </Flex>
        <Text style="body2" color="subtle" ellipsify>
          {collection.name}
        </Text>
        {!price && (
          <Text style="body2" color="error">
            Item no longer available
          </Text>
        )}
        {priceIncrease && (
          <Flex css={{ gap: '$1', color: '$accentSolidHover' }} align="center">
            <FontAwesomeIcon width="11" icon={faArrowUp} />
            <Text style="body2" color="accent">
              Price has gone up {formatNumber(priceDiff)}%
            </Text>
          </Flex>
        )}
        {priceDecrease && (
          <Flex css={{ gap: '$1', color: '$accentSolidHover' }} align="center">
            <FontAwesomeIcon width="11" icon={faArrowDown} />
            <Text style="body2" color="accent">
              Price went down {formatNumber(priceDiff)}%
            </Text>
          </Flex>
        )}
      </Flex>
      {price && (
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
            logoWidth={12}
          />
          {usdPrice && usdPrice > 0 && (
            <FormatCurrency
              amount={usdPrice}
              style="tiny"
              color="subtle"
              css={{ textAlign: 'end' }}
            />
          )}
        </Flex>
      )}
    </Flex>
  )
}

export default CartItem
