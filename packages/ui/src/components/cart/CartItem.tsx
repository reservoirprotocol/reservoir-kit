import React, { FC } from 'react'
import { useReservoirClient, useTokens } from '../../hooks'
import {
  Box,
  Button,
  Flex,
  FormatCryptoCurrency,
  FormatCurrency,
  Text,
} from '../../primitives'
import { styled } from '../../../stitches.config'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClose } from '@fortawesome/free-solid-svg-icons'

type Token = NonNullable<ReturnType<typeof useTokens>['data'][0]>
type FloorAsk = NonNullable<NonNullable<Token['market']>['floorAsk']>
type CartItemPrice = NonNullable<FloorAsk['price']>

type Props = {
  token: {
    name: string
    id: number
  }
  collection: {
    id: string
    name: string
  }
  price: CartItemPrice
  usdConversion: number
}

const CartItemImage = styled('img', {
  width: 56,
  height: 56,
  borderRadius: 4,
  objectFit: 'cover',
})

const CartItem: FC<Props> = ({ token, collection, price, usdConversion }) => {
  const client = useReservoirClient()
  const usdPrice = (usdConversion || 0) * (price.amount?.decimal || 0)

  return (
    <Flex css={{ width: '100%' }}>
      <Box css={{ position: 'relative', minWidth: 0 }}>
        <CartItemImage
          src={`${client?.apiBase}/redirect/tokens/${collection.id}:${token.id}/image/v1`}
        />
        <Button
          size="none"
          corners="circle"
          css={{
            position: 'absolute',
            width: 24,
            height: 24,
            background: '$neutralSolid',
            top: -8,
            right: -8,
            '&:hover': {
              backgroundColor: '$neutralSolidHover',
            },
          }}
          onClick={() => {
            //remove item
          }}
        >
          <FontAwesomeIcon icon={faClose} width="16" height="16" />
        </Button>
      </Box>
      <Flex
        direction="column"
        justify="center"
        css={{ gap: 2, ml: '$2', minWidth: 0 }}
      >
        <Text style="h6" ellipsify>
          {token.name}
        </Text>
        <Text style="body2" color="subtle" ellipsify>
          {collection.name}
        </Text>
      </Flex>
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
    </Flex>
  )
}

export default CartItem
