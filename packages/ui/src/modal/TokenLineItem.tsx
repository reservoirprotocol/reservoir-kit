import React, { FC } from 'react'
import { Box, ErrorWell } from '../primitives'
import TokenPrimitive from './TokenPrimitive'

import { useCollections, useTokens } from '../hooks'

type TokenLineItemProps = {
  tokenDetails: NonNullable<
    NonNullable<ReturnType<typeof useTokens>>['data']
  >[0]
  collection?: NonNullable<ReturnType<typeof useCollections>['data']>[0]
  usdConversion?: number
  isSuspicious?: Boolean
  isUnavailable?: boolean
}

const TokenLineItem: FC<TokenLineItemProps> = ({
  tokenDetails,
  collection,
  usdConversion = 0,
  isSuspicious,
  isUnavailable,
}) => {
  const marketData = tokenDetails?.market
  let price: number = marketData?.floorAsk?.price?.amount?.native || 0

  if (!price && tokenDetails?.token?.lastSell?.value) {
    price = tokenDetails?.token.lastSell.value
  }
  const usdPrice = price * usdConversion

  if (!tokenDetails) {
    return null
  }

  const name = tokenDetails?.token?.name || `#${tokenDetails?.token?.tokenId}`
  const collectionName =
    tokenDetails?.token?.collection?.name || collection?.name || ''

  const img = tokenDetails?.token?.image
    ? tokenDetails.token.image
    : (collection?.image as string)
  const srcImg = marketData?.floorAsk?.source
    ? (marketData?.floorAsk?.source['icon'] as string)
    : ''
  let royalty: number | undefined = collection?.royalties?.bps || undefined

  if (royalty) {
    royalty = royalty * 0.01
  }

  return (
    <Box css={{ p: '$4', borderBottom: '1px solid $borderColor' }}>
      <TokenPrimitive
        img={img}
        name={name}
        price={price}
        usdPrice={usdPrice}
        collection={collectionName}
        royalty={royalty}
        source={srcImg}
        isUnavailable={isUnavailable}
      />
      {!!isSuspicious && (
        <ErrorWell
          css={{ p: '$3', mt: '$3', borderRadius: 4 }}
          message="Token is not tradable on OpenSea"
        />
      )}
    </Box>
  )
}

export default TokenLineItem
