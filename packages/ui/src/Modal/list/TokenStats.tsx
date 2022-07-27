import React, { FC } from 'react'
import { Flex, Box } from '../../primitives'
import Token from './Token'
import Stat from './Stat'
import { useTokenDetails, useCollection } from '../../hooks'

type Props = {
  token?: NonNullable<
    NonNullable<ReturnType<typeof useTokenDetails>>['tokens']
  >['0']
  collection: ReturnType<typeof useCollection>
}

const TokenStats: FC<Props> = ({ token, collection }) => {
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
            label: 'Creator Royalties',
            value: (collection?.royalties?.bps || 0) * 10_000 + '%',
          },
          {
            label: 'Last Price',
            value: token?.token?.lastSell?.value || '--',
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
