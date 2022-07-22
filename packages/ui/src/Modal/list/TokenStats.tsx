import React from 'react'
import { styled } from '../../../stitches.config'
import { Flex, Box, Text } from '../../primitives'

import Stat from './Stat'

const Img = styled('img', {
  width: '100%',
  '@bp1': {
    height: 150,
    width: 150,
  },
  borderRadius: '$borderRadius',
})

const TokenStats = ({ token, collection }: any) => {
  let attributeFloor = Math.max(
    ...token.token.attributes.map((attr: any) => Number(attr.floorAskPrice)),
    0
  )
  return (
    <Flex
      css={{
        width: '100%',
        flexDirection: 'row',
        '@bp1': {
          width: 220,
          flexDirection: 'column',
        },
        p: '$4',
      }}
    >
      <Box
        css={{
          mr: '$4',
          width: 120,
          '@bp1': {
            mr: 0,
            width: '100%',
          },
        }}
      >
        <Text
          style="subtitle2"
          color="subtle"
          css={{ mb: '$1', display: 'block' }}
        >
          Item
        </Text>
        <Img src={token?.token?.image} css={{ mb: '$2' }} />
        <Text style="h6" css={{ flex: 1 }} as="h6">
          {token?.token?.name || `#${token?.token?.tokenId}`}
        </Text>
        <Box>
          <Text style="subtitle2" color="subtle" as="p">
            {token?.token?.collection?.name}
          </Text>
        </Box>
      </Box>
      <Box
        css={{
          flex: 1,
          mt: '$4',
          [`& ${Stat}:not(:last-child)`]: {
            mb: '$1',
          },
          mb: '$3',
        }}
      >
        {[
          {
            label: 'Creator Royalties',
            value: (collection?.royalties?.bsp || 0) * 10_000 + '%',
          },
          {
            label: 'Last Price',
            value: token?.token?.lastSell?.value,
            asEth: true,
          },
          {
            label: 'Floor',
            value: collection?.floorAsk?.price || 0,
            asEth: true,
          },
          {
            label: 'Highest Trait Floor',
            value: attributeFloor || collection?.floorAsk?.price || 0,
            asEth: true,
          },
        ].map((stat) => (
          <Stat {...stat} />
        ))}
      </Box>
    </Flex>
  )
}

export default TokenStats
