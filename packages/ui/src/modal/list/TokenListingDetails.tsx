import React, { FC } from 'react'
import { Flex, Box } from '../../primitives'
import Token from './Token'
import Stat from '../Stat'
import ListingStat from './ListingStat'
import { useTokens, useCollections } from '../../hooks'
import { ListingData } from './ListModalRenderer'
import { Currency } from '../../types/Currency'

type Props = {
  token?: NonNullable<NonNullable<ReturnType<typeof useTokens>>['data']>['0']
  collection?: NonNullable<ReturnType<typeof useCollections>['data']>[0]
  listingData: ListingData[]
  currency: Currency
}

const TokenListingDetails: FC<Props> = ({
  token,
  collection,
  listingData,
  currency,
}) => (
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
      {listingData.map((data, i) => (
        <ListingStat
          key={i}
          listing={data.listing}
          marketImg={data.marketplace.imageUrl || ''}
          currency={currency}
        />
      ))}
    </Box>
  </Flex>
)

export default TokenListingDetails
