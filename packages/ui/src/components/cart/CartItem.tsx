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
import { faClose } from '@fortawesome/free-solid-svg-icons'
import { Cart } from '../../context/CartProvider'
import InfoTooltip from '../../primitives/InfoTooltip'

type Props = {
  item: Cart['items'][0]
  usdConversion: number
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

const CartItem: FC<Props> = ({ item, usdConversion }) => {
  const { token, collection, price, isBannedOnOpensea } = item
  const client = useReservoirClient()
  const usdPrice = (usdConversion || 0) * (price?.amount?.decimal || 0)
  const { remove } = useCart(() => null)

  return (
    <Flex
      css={{
        width: '100%',
        px: 24,
        py: 8,
        transition: 'background-color 0.25s ease-in-out',
        '&:hover': {
          backgroundColor: '$neutralBgHover',
          [`& ${CloseButton}`]: {
            background: '$accentSolid',
          },
        },
      }}
    >
      <Flex css={{ position: 'relative', minWidth: 0 }}>
        <CartItemImage
          src={`${client?.apiBase}/redirect/tokens/${collection.id}:${token.id}/image/v1`}
          css={!price ? { filter: 'grayscale(1)' } : {}}
        />
        <CloseButton
          css={{ background: '$neutralSolid' }}
          onClick={() => {
            remove(token.id, collection.id)
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
            {token.name}
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
          <Text style="body2" color="errorLight">
            Item no longer available
          </Text>
        )}
      </Flex>
      {price && (
        <Flex
          direction="column"
          justify="center"
          css={{ ml: 'auto', gap: '$1', '> div': { ml: 'auto' } }}
        >
          <FormatCryptoCurrency
            textStyle="subtitle2"
            amount={price.amount?.decimal}
            address={price.currency?.contract}
            decimals={price.currency?.decimals}
            logoWidth={12}
          />
          {usdPrice && (
            <FormatCurrency amount={usdPrice} style="tiny" color="subtle" />
          )}
        </Flex>
      )}
    </Flex>
  )
}

export default CartItem
