import React, { ComponentPropsWithoutRef, FC } from 'react'
import { Flex, Box } from '../../primitives'
import TokenStatsHeader from './TokenStatsHeader'
import Stat from '../Stat'
import { useTokens, useCollections } from '../../hooks'
import InfoTooltip from '../InfoTooltip'

type Props = {
  token?: NonNullable<NonNullable<ReturnType<typeof useTokens>>['data']>['0']
  collection: NonNullable<ReturnType<typeof useCollections>['data']>[0]
}

const TokenStats: FC<Props> = ({ token, collection }) => {
  let stats: (ComponentPropsWithoutRef<typeof Stat> & { id: number })[] = [
    {
      id: 0,
      label: (
        <Flex css={{ alignItems: 'center', gap: 8 }}>
          <span>Creator Royalties</span>
          <InfoTooltip
            side="right"
            width={200}
            content={
              'A fee on every order that goes to the collection creator.'
            }
          />
        </Flex>
      ),
      value: (collection?.royalties?.bps || 0) * 0.01 + '%',
    },
    {
      id: 1,
      label: 'Highest Offer',
      value: token
        ? token.market?.topBid?.price?.amount?.native || null
        : collection?.topBid?.price?.amount?.native || null,
      asWeth: true,
    },
  ]

  if (token) {
    stats.push({
      id: 2,
      label: 'List Price',
      value: token.market?.floorAsk?.price?.amount?.native || 0,
      asEth: true,
    })
  } else if (!token && collection) {
    stats.push({
      id: 2,
      label: 'Floor',
      value: collection?.floorAsk?.price?.amount?.native || 0,
      asEth: true,
    })
  }

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
      <TokenStatsHeader collection={collection} token={token} />
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
        {stats.map((stat) => (
          <Stat key={stat.id} {...stat} />
        ))}
      </Box>
    </Flex>
  )
}

export default TokenStats
