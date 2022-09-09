import React, { FC } from 'react'
import { Box, ErrorWell } from '../primitives'
import TokenPrimitive from './TokenPrimitive'
import relativeTime from 'dayjs/plugin/relativeTime'
import dayjs from 'dayjs'
dayjs.extend(relativeTime)
import { useCollections, useTokens } from '../hooks'

type TokenLineItemProps = {
  tokenDetails: NonNullable<
    NonNullable<ReturnType<typeof useTokens>>['data']
  >[0]
  collection?: NonNullable<ReturnType<typeof useCollections>['data']>[0]
  usdConversion?: number
  isSuspicious?: Boolean
  isUnavailable?: boolean
  isOffer?: boolean
}

const TokenLineItem: FC<TokenLineItemProps> = ({
  tokenDetails,
  collection,
  usdConversion = 0,
  isSuspicious,
  isUnavailable,
  isOffer,
}) => {
  const marketData = tokenDetails?.market
  let price: number = 0
  if (isOffer) {
    price = marketData?.topBid?.price?.amount?.native || 0
  } else {
    price = marketData?.floorAsk?.price?.amount?.native || 0

    if (!price && tokenDetails?.token?.lastSell?.value) {
      price = tokenDetails?.token.lastSell.value
    }
  }
  const usdPrice = price * usdConversion

  if (!tokenDetails) {
    return null
  }

  const name = tokenDetails?.token?.name || `#${tokenDetails?.token?.tokenId}`
  const collectionName =
    tokenDetails?.token?.collection?.name || collection?.name || ''

  const validUntil = marketData?.topBid?.validUntil
  const expires = validUntil ? dayjs.unix(validUntil).fromNow() : undefined

  const topBid = marketData?.topBid?.price?.amount?.native
  const floorPrice = marketData?.floorAsk?.price?.amount?.native

  const difference =
    floorPrice && topBid
      ? ((floorPrice - topBid) / floorPrice) * 100
      : undefined

  const floorWarning =
    difference && difference > 50
      ? `${difference}% lower than floor price`
      : undefined

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
    <Box css={{ p: '$4', mb: '$4', borderBottom: '1px solid $borderColor' }}>
      <TokenPrimitive
        img={img}
        name={name}
        price={price}
        usdPrice={usdPrice}
        collection={collectionName}
        royalty={royalty}
        expires={expires}
        floorWarning={floorWarning}
        isOffer={isOffer}
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
