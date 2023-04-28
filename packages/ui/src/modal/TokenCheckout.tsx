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

enum Size {
  SM,
  LG,
}

type Props = {
  itemCount: number
  images: string[]
  totalPrice: number
  usdPrice: number
  currency?: NonNullable<Cart['items'][0]['price']>['currency']
  chain?: ReservoirChain
  size?: Size
}

export const TokenCheckout: FC<Props> = ({
  itemCount,
  images,
  totalPrice,
  usdPrice,
  currency,
  chain,
  size = Size.LG,
}) => {
  const itemSubject = itemCount > 1 ? 'items' : 'item'
  return (
    <Flex justify="between" align="center" css={{ width: '100%' }}>
      <Flex align="center" css={{ gap: size == Size.SM ? '$3' : '$4' }}>
        <Flex>
          {images.map((image) => (
            <Img
              src={image}
              key={image}
              css={{
                height: size == Size.SM ? 40 : 56,
                width: size == Size.SM ? 40 : 56,
                '& + img': {
                  marginLeft: size == Size.SM ? -32 : -48,
                },
              }}
            />
          ))}
        </Flex>
        <Text style={size == Size.SM ? 'subtitle2' : 'h6'}>
          {itemCount} {itemSubject}
        </Text>
      </Flex>
      <Flex direction="column" align="end" css={{ gap: '$1' }}>
        <FormatCryptoCurrency
          textStyle={size == Size.SM ? 'subtitle2' : 'h6'}
          amount={totalPrice}
          address={currency?.contract}
          decimals={currency?.decimals}
          symbol={currency?.symbol}
          logoWidth={size == Size.SM ? 12 : 18}
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
