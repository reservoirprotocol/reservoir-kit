import React, { FC, useState, useEffect } from 'react'
import { Box, Flex, Text } from '../primitives'
import TokenPrimitive from './TokenPrimitive'
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { useCollection, useTokenDetails, useHistoricalSales } from '../hooks'

type TokenLineItemProps = {
  token: NonNullable<
    NonNullable<ReturnType<typeof useTokenDetails>>['tokens']
  >['0']
  collection: ReturnType<typeof useCollection>
  usdConversion?: number
  isSuspicious?: Boolean
  lastSale?: ReturnType<typeof useHistoricalSales>
  isUnavailable?: boolean
}

const TokenLineItem: FC<TokenLineItemProps> = ({
  token,
  collection,
  usdConversion = 0,
  isSuspicious,
  lastSale,
  isUnavailable,
}) => {
  const [price, setPrice] = useState(0)
  const tokenDetails = token.token
  const marketData = token.market
  const usdPrice = price * usdConversion

  useEffect(() => {
    if (token.market?.floorAsk?.price) {
      setPrice(token.market.floorAsk.price)
    } else if (lastSale?.sales && lastSale?.sales?.length > 0) {
      setPrice(lastSale.sales[0].price || 0)
    }
  }, [tokenDetails, lastSale])

  if (!tokenDetails) {
    return null
  }

  const name = tokenDetails?.name || `#${tokenDetails.tokenId}`
  const collectionName = tokenDetails.collection?.name || collection?.name || ''

  const img = tokenDetails.image
    ? tokenDetails.image
    : (collection?.metadata?.imageUrl as string)
  const srcImg = marketData?.floorAsk?.source
    ? (marketData?.floorAsk?.source['icon'] as string)
    : ''
  const royalty: number | undefined = collection?.royalties?.bps || undefined

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
        <Flex
          align="center"
          css={{
            backgroundColor: '$wellBackground',
            p: '$3',
            mt: '$3',
            borderRadius: 4,
          }}
        >
          <Box css={{ color: '$errorAccent', mr: '$2' }}>
            <FontAwesomeIcon icon={faInfoCircle} />
          </Box>
          <Text style="body2" color="errorLight">
            This item was reported for suspicious activity on OpenSea
          </Text>
        </Flex>
      )}
    </Box>
  )
}

export default TokenLineItem
