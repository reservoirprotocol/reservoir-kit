import React, { FC, useEffect, useState } from 'react'
import { Flex, Box, FormatWrappedCurrency, Text } from '../../primitives'
import { useTokens, useCollections } from '../../hooks'
import { BidData } from './BidModalRenderer'
import { useTimeSince } from '../../hooks'
import SelectedAttribute from './SelectedAttribute'
import { formatEther } from 'viem'
import { ReservoirChain } from '@reservoir0x/reservoir-sdk'
import TokenInfo from './TokenInfo'

type Props = {
  token?: NonNullable<NonNullable<ReturnType<typeof useTokens>>['data']>['0']
  collection: NonNullable<ReturnType<typeof useCollections>['data']>[0]
  bidData: BidData | null
  chain?: ReservoirChain | null
}

const TransactionBidDetails: FC<Props> = ({
  token,
  collection,
  bidData,
  chain,
}) => {
  const [value, setValue] = useState('')
  const timeSince = useTimeSince(
    bidData?.expirationTime ? +bidData.expirationTime : 0
  )

  useEffect(() => {
    setValue(bidData ? formatEther(BigInt(bidData.weiPrice)) : '')
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
      <TokenInfo collection={collection} token={token} chain={chain} />

      <Box
        css={{
          flex: 1,
          mb: '$3',
        }}
      >
        <SelectedAttribute
          attributeKey={bidData?.attributeKey}
          attributeValue={bidData?.attributeValue}
        />
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
            <Text style="subtitle3">Offer Price</Text>
            <FormatWrappedCurrency
              chainId={chain?.id}
              amount={+value}
              textStyle="subtitle3"
              address={bidData?.currency}
            />
          </Flex>
          <Text style="subtitle3" color="subtle" as="p" css={{ flex: 1 }}>
            {bidData?.expirationTime ? `Expires ${timeSince}` : 'No Expiration'}
          </Text>
        </Flex>
      </Box>
    </Flex>
  )
}

export default TransactionBidDetails
