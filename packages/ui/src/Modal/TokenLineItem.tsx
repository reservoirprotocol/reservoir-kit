import React, { FC } from 'react'
import { Box, Flex, Text } from '../primitives'
import TokenPrimitive from './TokenPrimitive'
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { useCollection, useTokenDetails } from '../hooks'

type TokenLineItemProps = {
  token: NonNullable<
    NonNullable<ReturnType<typeof useTokenDetails>>['tokens']
  >['0']
  collection: ReturnType<typeof useCollection>
  usdConversion?: number
  isSuspicious?: Boolean
  isUnavailable?: boolean
}

const TokenLineItem: FC<TokenLineItemProps> = ({
  token,
  collection,
  usdConversion = 0,
  isSuspicious,
  isUnavailable,
}) => {
  const tokenDetails = token.token
  const marketData = token.market
  let price: number = token.market?.floorAsk?.price || 0

  if (!price && token.token?.lastSell?.value) {
    price = token.token.lastSell.value
  }
  const usdPrice = price * usdConversion

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
