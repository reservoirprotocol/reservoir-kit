import React, { FC } from 'react'
import { Box, Flex, Text } from '../primitives'
import TokenPrimitive from './TokenPrimitive'
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { useCollection, useTokenDetails, useEthConverter } from '../hooks'

type TokenLineItemProps = {
  token: NonNullable<
    NonNullable<ReturnType<typeof useTokenDetails>>['tokens']
  >['0']
  collection: ReturnType<typeof useCollection>
  isSuspicious?: Boolean
}

const TokenLineItem: FC<TokenLineItemProps> = ({
  token,
  collection,
  isSuspicious,
}) => {
  const tokenDetails = token.token
  const marketData = token.market
  const usdPrice = useEthConverter(marketData?.floorAsk?.price || 0, 'USD') || 0

  if (!tokenDetails || !marketData?.floorAsk?.price) {
    return null
  }
  const name = tokenDetails?.name || `#${tokenDetails.tokenId}`

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
        price={marketData.floorAsk.price}
        usdPrice={usdPrice}
        collection={collection?.name || ''}
        royalty={royalty}
        source={srcImg}
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
