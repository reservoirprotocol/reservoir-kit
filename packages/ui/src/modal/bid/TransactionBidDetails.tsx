import React, { FC, useEffect, useState } from 'react'
import { Flex, Box, FormatWEth, Text } from '../../primitives'
import TokenStatsHeader from './TokenStatsHeader'
import { useTokenDetails, useCollection } from '../../hooks'
import { BidData } from './BidModalRenderer'
import { useTimeSince } from '../../hooks'
import { formatEther } from 'ethers/lib/utils'

type Props = {
  token?: NonNullable<
    NonNullable<ReturnType<typeof useTokenDetails>>['data']
  >['0']
  collection: ReturnType<typeof useCollection>['data']
  bidData: BidData | null
}

const TransactionBidDetails: FC<Props> = ({ token, collection, bidData }) => {
  const [value, setValue] = useState('')
  const timeSince = useTimeSince(
    bidData?.expirationTime ? +bidData.expirationTime : 0
  )

  useEffect(() => {
    setValue(bidData ? formatEther(bidData.weiPrice) : '')
  }, [bidData])

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
          mb: '$3',
        }}
      >
        <Flex
          direction="column"
          className="rk-stat-well"
          css={{
            backgroundColor: '$wellBackground',
            p: '$2',
            borderRadius: '$borderRadius',
            gap: '$1',
          }}
        >
          <Flex justify="between">
            <FormatWEth amount={+value} textStyle="subtitle2" />
          </Flex>
          <Text style="subtitle2" color="subtle" as="p" css={{ flex: 1 }}>
            {bidData?.expirationTime ? `Expires ${timeSince}` : 'No Expiration'}
          </Text>
        </Flex>
      </Box>
    </Flex>
  )
}

export default TransactionBidDetails
