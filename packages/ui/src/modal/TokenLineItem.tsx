import React, { FC } from 'react'
import { Box } from '../primitives'
import TokenPrimitive from './TokenPrimitive'
import { useCollections, useTokens } from '../hooks'
import { CSSProperties } from '@stitches/react'

type TokenLineItemProps = {
  tokenDetails?: NonNullable<
    NonNullable<ReturnType<typeof useTokens>>['data']
  >[0]
  collection?: Pick<
    NonNullable<ReturnType<typeof useCollections>['data']>[0],
    'name' | 'royalties' | 'image'
  >
  usdConversion?: number
  isUnavailable?: boolean
  warning?: string
  price: number
  priceSubtitle?: string
  currency?: {
    contract?: string
    decimals?: number
    symbol?: string
  }
  expires?: string
  sourceImg?: string
  css?: CSSProperties
  showRoyalties?: boolean
  quantity?: number
}

const TokenLineItem: FC<TokenLineItemProps> = ({
  tokenDetails,
  collection,
  usdConversion = 0,
  isUnavailable,
  price,
  priceSubtitle,
  warning,
  currency,
  expires,
  sourceImg,
  css,
  showRoyalties,
  quantity,
}) => {
  if (!tokenDetails) {
    return null
  }

  const usdPrice = price * usdConversion

  const name = tokenDetails?.token?.name || `#${tokenDetails?.token?.tokenId}`
  const collectionName =
    tokenDetails?.token?.collection?.name || collection?.name || ''

  const img = tokenDetails?.token?.imageSmall
    ? tokenDetails.token.imageSmall
    : (collection?.image as string)

  const royaltiesBps =
    showRoyalties && collection?.royalties
      ? collection.royalties.bps
      : undefined

  return (
    <Box css={{ p: '$4', borderBottom: '1px solid $borderColor', ...css }}>
      <TokenPrimitive
        img={img}
        name={name}
        price={price}
        usdPrice={usdPrice}
        collection={collectionName}
        currencyContract={currency?.contract}
        currencyDecimals={currency?.decimals}
        currencySymbol={currency?.symbol}
        expires={expires}
        warning={warning}
        source={sourceImg || ''}
        isUnavailable={isUnavailable}
        priceSubtitle={priceSubtitle}
        royaltiesBps={royaltiesBps}
        quantity={quantity}
      />
    </Box>
  )
}

export default TokenLineItem
