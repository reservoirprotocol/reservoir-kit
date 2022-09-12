import React, { FC } from 'react'
import { Box, ErrorWell } from '../primitives'
import TokenPrimitive from './TokenPrimitive'
import { useCollections, useTimeSince, useTokens } from '../hooks'

type TokenLineItemProps = {
  tokenDetails: NonNullable<
    NonNullable<ReturnType<typeof useTokens>>['data']
  >[0]
  collection?: NonNullable<ReturnType<typeof useCollections>['data']>[0]
  usdConversion?: number
  isSuspicious?: Boolean
  isUnavailable?: boolean
  warning?: string
  price: number
  currency?: {
    contract?: string
    decimals?: number
  }
}

const TokenLineItem: FC<TokenLineItemProps> = ({
  tokenDetails,
  collection,
  usdConversion = 0,
  isSuspicious,
  isUnavailable,
  price,
  warning,
  currency,
}) => {
  const marketData = tokenDetails?.market
  const validUntil = marketData?.topBid?.validUntil
  const expires = useTimeSince(validUntil)

  if (!tokenDetails) {
    return null
  }

  const usdPrice = price * usdConversion

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
        currencyContract={currency?.contract}
        currencyDecimals={currency?.decimals}
        royalty={royalty}
        expires={expires}
        warning={warning}
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
