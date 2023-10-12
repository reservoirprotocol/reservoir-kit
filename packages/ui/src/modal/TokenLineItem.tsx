import React, { FC } from 'react'
import { Box } from '../primitives'
import TokenPrimitive from './TokenPrimitive'
import { useCollections, useTokens } from '../hooks'
import { CSSProperties } from '@stitches/react'
import { ReservoirChain } from '@reservoir0x/reservoir-sdk'
import { EnhancedCurrency } from '../hooks/usePaymentTokens'
import { formatUnits } from 'viem'

type TokenLineItemProps = {
  tokenDetails?: NonNullable<
    NonNullable<ReturnType<typeof useTokens>>['data']
  >[0]
  collection?: Pick<
    NonNullable<ReturnType<typeof useCollections>['data']>[0],
    'name' | 'royalties' | 'image'
  >
  usdPrice?: string
  isUnavailable?: boolean
  warning?: string
  price: bigint
  priceSubtitle?: string
  currency?: EnhancedCurrency
  expires?: string
  sourceImg?: string
  css?: CSSProperties
  chain?: ReservoirChain | null
  showRoyalties?: boolean
  quantity?: number
}

const TokenLineItem: FC<TokenLineItemProps> = ({
  tokenDetails,
  collection,
  chain,
  usdPrice,
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

  const formattedPrice = Number(formatUnits(price, currency?.decimals || 18))

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
        price={formattedPrice}
        usdPrice={usdPrice}
        collection={collectionName}
        currencyContract={currency?.address}
        currencyDecimals={currency?.decimals}
        currencySymbol={currency?.symbol}
        expires={expires}
        warning={warning}
        source={sourceImg || ''}
        chain={chain}
        isUnavailable={isUnavailable}
        priceSubtitle={priceSubtitle}
        royaltiesBps={royaltiesBps}
        quantity={quantity}
      />
    </Box>
  )
}

export default TokenLineItem
