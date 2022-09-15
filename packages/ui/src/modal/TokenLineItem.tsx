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
  warning?: string
  price: number
  currency?: {
    contract?: string
    decimals?: number
  }
  expires?: string
  hideRoyalty?: boolean
  isOffer?: boolean
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
  expires,
  hideRoyalty,
  isOffer,
}) => {
  const marketData = tokenDetails?.market

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
  let royalty: number | undefined = hideRoyalty
    ? undefined
    : collection?.royalties?.bps

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
        isOffer={isOffer}
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
