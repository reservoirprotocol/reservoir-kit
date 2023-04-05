import { ReservoirChain } from '@reservoir0x/reservoir-sdk'
import { styled } from '@stitches/react'
import React, { FC } from 'react'
import { Cart } from '../context/CartProvider'
import { Flex, FormatCryptoCurrency, FormatCurrency, Text } from '../primitives'

const Img = styled('img', {
  height: 56,
  width: 56,
  borderRadius: 4,
  objectFit: 'cover',
  '& + img': {
    marginLeft: -48,
    zIndex: -1,
  },
})

type Props = {
  itemCount: number
  images: string[]
  totalPrice: number
  usdPrice: number
  currency?: NonNullable<Cart['items'][0]['price']>['currency']
  chain?: ReservoirChain
}

export const TokenCheckout: FC<Props> = ({
  itemCount,
  images,
  totalPrice,
  usdPrice,
  currency,
  chain,
}) => {
  const itemSubject = itemCount > 1 ? 'items' : 'item'
  return (
    <Flex justify="between" align="center">
      <Flex align="center" css={{ gap: '$4' }}>
        <Flex>
          {images.map((image) => (
            <Img src={image} />
          ))}
        </Flex>
        <Text style="h6">
          {itemCount} {itemSubject}
        </Text>
      </Flex>
      <Flex direction="column" align="end" css={{ gap: '$1' }}>
        <FormatCryptoCurrency
          textStyle="h6"
          amount={totalPrice}
          address={currency?.contract}
          decimals={currency?.decimals}
          logoWidth={18}
          chainId={chain?.id}
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
  )
}
