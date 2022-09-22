import React, { FC, useEffect, useState } from 'react'
import { Flex, Box, FormatWEth, Text } from '../../primitives'
import TokenStatsHeader from './TokenStatsHeader'
import { useTokens, useCollections } from '../../hooks'
import { BidData } from './BidModalRenderer'
import { useTimeSince } from '../../hooks'
import { formatEther } from 'ethers/lib/utils'

type Props = {
  token?: NonNullable<NonNullable<ReturnType<typeof useTokens>>['data']>['0']
  collection: NonNullable<ReturnType<typeof useCollections>['data']>[0]
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
          mb: '$3',
        }}
      >
        {bidData?.attributeKey && (
          <Box
            css={{
              padding: '$2',
              borderRadius: '$1',
              backgroundColor: '$neutralBgHover',
              marginBottom: '$4',
              maxWidth: 188,
              width: 'fit-content',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            <Text color="accent">{bidData.attributeKey}: </Text>
            <Text>{bidData.attributeValue}</Text>
          </Box>
        )}
        {bidData?.attributeKey && (
          <Flex
            className="rk-stat-well"
            css={{
              justifyContent: 'space-between',
              backgroundColor: '$wellBackground',
              p: '$2',
              borderRadius: '$borderRadius',
              gap: '$1',
              mb: '$2',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            <Text color="accent">{bidData.attributeKey}</Text>
            <Text
              css={{
                marginLeft: '$2',
                maxWidth: 180,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {bidData.attributeValue}
            </Text>
          </Flex>
        )}
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
            <Text style="subtitle2">Offer Price</Text>
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
