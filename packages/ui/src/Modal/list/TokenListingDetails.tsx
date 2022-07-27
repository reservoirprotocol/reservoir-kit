import React, { FC } from 'react'
import { Flex, Box } from '../../primitives'
import Token from './Token'
import Stat from './Stat'
import ListingStat from './ListingStat'
import { useTokenDetails, useCollection } from '../../hooks'

type Props = {
  token?: NonNullable<
    NonNullable<ReturnType<typeof useTokenDetails>>['tokens']
  >['0']
  collection: ReturnType<typeof useCollection>
  listings: {
    value: string
    expiration: string
    marketImg: string
  }[]
}

const TokenListingDetails: FC<Props> = ({ token, collection, listings }) => {
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
        {listings.map((listing, i) => (
          <ListingStat
            key={i}
            value={listing.value}
            label={listing.expiration}
            marketImg={listing.marketImg}
          />
        ))}
      </Box>
    </Flex>
  )
}

export default TokenListingDetails
