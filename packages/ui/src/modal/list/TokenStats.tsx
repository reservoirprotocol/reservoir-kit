import React, { FC } from 'react'
import { Flex, Box, Text } from '../../primitives'
import Token from './Token'
import Stat from '../Stat'
import { useTokens, useCollections } from '../../hooks'
import InfoTooltip from '../../primitives/InfoTooltip'

type Props = {
  token?: NonNullable<NonNullable<ReturnType<typeof useTokens>>['data']>['0']
  collection?: NonNullable<ReturnType<typeof useCollections>['data']>[0]
  royaltyBps?: number
}

const TokenStats: FC<Props> = ({ token, collection, royaltyBps = 0 }) => {
  let attributeFloor = token?.token?.attributes
    ? Math.max(
        ...token.token.attributes.map((attr: any) =>
          Number(attr.floorAskPrice)
        ),
        0
      )
    : 0
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
      <Token collection={collection} token={token} />
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
            value: `${royaltyBps * 0.01}%`,
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
                Last Sale
              </Text>
            ),
            value: token?.token?.lastSale?.price?.amount?.decimal || null,
            address: token?.token?.lastSale?.price?.currency?.contract,
            symbol: token?.token?.lastSale?.price?.currency?.symbol,
            asNative: true,
          },
          {
            id: 2,
            label: (
              <Text
                style="subtitle2"
                color="subtle"
                css={{ minWidth: '0' }}
                ellipsify
              >
                Collection Floor
              </Text>
            ),
            value: collection?.floorAsk?.price?.amount?.native || 0,
            address: collection?.floorAsk?.price?.currency?.contract,
            symbol: collection?.floorAsk?.price?.currency?.symbol,
            asNative: true,
          },
          {
            id: 3,
            label: (
              <>
                <Text
                  style="subtitle2"
                  color="subtle"
                  css={{ minWidth: '0' }}
                  ellipsify
                >
                  Highest Trait Floor
                </Text>
                <InfoTooltip
                  side="right"
                  width={200}
                  content={
                    'The floor price of the most valuable trait of a token.'
                  }
                />
              </>
            ),
            value:
              attributeFloor ||
              collection?.floorAsk?.price?.amount?.native ||
              0,
            symbol: attributeFloor
              ? undefined
              : collection?.floorAsk?.price?.currency?.symbol,
            asNative: true,
          },
        ].map((stat) => (
          <Stat key={stat.id} {...stat} />
        ))}
      </Box>
    </Flex>
  )
}

export default TokenStats
