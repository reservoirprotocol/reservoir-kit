import React, { ComponentPropsWithoutRef, FC } from 'react'
import { Flex, Box, Grid, Text } from '../../primitives'
import TokenStatsHeader from './TokenStatsHeader'
import Stat from '../Stat'
import { useTokens, useCollections } from '../../hooks'
import InfoTooltip from '../../primitives/InfoTooltip'
import { Trait } from './BidModalRenderer'
import SelectedAttribute from './SelectedAttribute'

type Props = {
  token?: NonNullable<NonNullable<ReturnType<typeof useTokens>>['data']>['0']
  collection: NonNullable<ReturnType<typeof useCollections>['data']>[0]
  trait?: Trait
}

const TokenStats: FC<Props> = ({ token, collection, trait }) => {
  let stats: (ComponentPropsWithoutRef<typeof Stat> & { id: number })[] = []

  stats.push(
    {
      id: 0,
      label: (
        <>
          <Text
            style="subtitle2"
            color="subtle"
            css={{ minWidth: '0' }}
            ellipsify
          >
            Creator Royalties
          </Text>
          <InfoTooltip
            side="right"
            width={200}
            content={
              'A fee on every order that goes to the collection creator.'
            }
          />
        </>
      ),
      value: (collection?.royalties?.bps || 0) * 0.01 + '%',
    },
    {
      id: 1,
      label: (
        <Text
          style="subtitle2"
          color="subtle"
          css={{ minWidth: '0' }}
          ellipsify
        >
          Highest Offer
        </Text>
      ),
      value: token
        ? token.market?.topBid?.price?.amount?.decimal || null
        : collection?.topBid?.price?.amount?.decimal || null,
      address: token
        ? token?.market?.topBid?.price?.currency?.contract
        : collection?.topBid?.price?.currency?.contract,
      symbol: token
        ? token?.market?.topBid?.price?.currency?.symbol
        : collection?.topBid?.price?.currency?.symbol,
      asWrapped: true,
    }
  )

  if (token) {
    stats.push({
      id: 2,
      label: (
        <Text
          style="subtitle2"
          color="subtle"
          css={{ minWidth: '0' }}
          ellipsify
        >
          List Price
        </Text>
      ),
      value: token.market?.floorAsk?.price?.amount?.decimal || null,
      symbol: token?.market?.floorAsk?.price?.currency?.symbol,
      address: token?.market?.floorAsk?.price?.currency?.contract,
      asNative: true,
    })
  } else if (!token && collection) {
    stats.push({
      id: 2,
      label: (
        <Text
          style="subtitle2"
          color="subtle"
          css={{ minWidth: '0' }}
          ellipsify
        >
          Floor
        </Text>
      ),
      value: collection?.floorAsk?.price?.amount?.decimal || null,
      symbol: collection?.floorAsk?.price?.currency?.symbol,
      address: collection?.floorAsk?.price?.currency?.contract,
      asNative: true,
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
      <Grid
        css={{
          flex: 1,
          alignContent: 'start',
          width: '100%',
          gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
        }}
      >
        <SelectedAttribute
          attributeKey={trait?.key}
          attributeValue={trait?.value}
        />
        <Box
          css={{
            flex: 1,
            [`& ${Stat}:not(:last-child)`]: {
              mb: '$1',
            },
          }}
        >
          {stats.map((stat) => (
            <Stat key={stat.id} {...stat} />
          ))}
        </Box>
      </Grid>
    </Flex>
  )
}

export default TokenStats
