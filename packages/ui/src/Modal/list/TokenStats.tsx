import React, { FC } from 'react'
import { Flex, Box } from '../../primitives'
import Token from './Token'
import Stat from './Stat'
import { useTokenDetails, useCollection } from '../../hooks'
import InfoTooltip from './InfoTooltip'

type Props = {
  token?: NonNullable<
    NonNullable<ReturnType<typeof useTokenDetails>>['data']
  >['0']
  collection: ReturnType<typeof useCollection>['data']
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
            id: 0,
            label: (
              <span>
                Creator Royalties{' '}
                <InfoTooltip
                  side="right"
                  width={200}
                  content={
                    'A fee taken out of every order that goes to the collection creator. This is set by the collection creators and is different for every collection.'
                  }
                />
              </span>
            ),
            value: (collection?.royalties?.bps || 0) * 0.01 + '%',
          },
          {
            id: 1,
            label: 'Last Price',
            value: token?.token?.lastSell?.value || '--',
            asEth: true,
          },
          {
            id: 2,
            label: 'Floor',
            value: collection?.floorAsk?.price || 0,
            asEth: true,
          },
          {
            id: 3,
            label: (
              <span>
                Highest Trait Floor{' '}
                <InfoTooltip
                  side="right"
                  width={200}
                  content={
                    'the highest floor price that a trait holds for this token.'
                  }
                />
              </span>
            ),
            value: attributeFloor || collection?.floorAsk?.price || 0,
            asEth: true,
          },
        ].map((stat) => (
          <Stat key={stat.id} {...stat} />
        ))}
      </Box>
    </Flex>
  )
}

export default TokenStats
