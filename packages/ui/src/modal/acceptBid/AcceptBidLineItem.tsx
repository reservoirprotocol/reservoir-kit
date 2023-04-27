import React, { FC } from 'react'
import { styled } from '../../../stitches.config'
import { Flex, FormatCryptoCurrency, Text } from '../../primitives'

type Props = {
  token: {
    name?: string
    id: string
  }
  collection?: {
    name: string
    id: string
  }
  royaltiesBps?: number
  img: string
  sourceImg?: string
  price?: number
  currency?: string
  decimals?: number
  nativeFloorPrice?: number
  nativePrice?: number
}

const Img = styled('img', {
  height: 56,
  width: 56,
})

const AcceptBidLineItem: FC<Props> = ({
  img,
  token,
  collection,
  royaltiesBps,
  sourceImg,
  price,
  nativeFloorPrice,
  nativePrice,
  currency,
  decimals,
}) => {
  const difference =
    nativeFloorPrice && nativePrice
      ? ((nativeFloorPrice - nativePrice) / nativeFloorPrice) * 100
      : undefined

  const warning =
    difference && difference > 50
      ? `${difference}% lower than floor price`
      : undefined

  return (
    <Flex css={{ p: '$4', borderBottom: '1px solid $borderColor', gap: '$2' }}>
      <Img
        src={img}
        alt={'Token Image'}
        css={{
          borderRadius: 4,
          overflow: 'hidden',
          visibility: !img || img.length === 0 ? 'hidden' : 'visible',
          flexShrink: 0,
          objectFit: 'cover',
        }}
      />
      <Flex direction="column" align="start" justify="center" css={{ gap: 2 }}>
        <Text style="h6">{token.name || `#${token.id}`}</Text>
        <Text style="body3">{collection?.name}</Text>
        {royaltiesBps ? (
          <Text style="body3" color="subtle">
            {royaltiesBps / 100}
          </Text>
        ) : null}
      </Flex>
      <Flex
        direction="column"
        align="end"
        justify="center"
        css={{ gap: '$1', ml: 'auto' }}
      >
        {sourceImg && <Img src={sourceImg} css={{ height: 16, width: 16 }} />}
        <FormatCryptoCurrency
          amount={price}
          address={currency}
          decimals={decimals}
          textStyle="subtitle2"
        />
        {warning && (
          <Text color="error" style="body2">
            64% lower than floor price
          </Text>
        )}
      </Flex>
    </Flex>
  )
}

export default AcceptBidLineItem
