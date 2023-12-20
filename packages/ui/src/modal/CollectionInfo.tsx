import React, { FC } from 'react'
import { ChainIcon, Divider, Flex, Img, Text } from '../primitives'
import { useCollections, useTimeSince } from '../hooks'
import { ReservoirChain } from '@reservoir0x/reservoir-sdk'

type Props = {
  collection?: NonNullable<ReturnType<typeof useCollections>['data']>[0]
  chain?: ReservoirChain | null
}

export const CollectionInfo: FC<Props> = ({ collection, chain }) => {
  const mintData = collection?.mintStages?.find(
    (stage) => stage.kind === 'public'
  )

  const mintEndTime = mintData ? useTimeSince(mintData?.endTime) : undefined

  return (
    <Flex
      justify="between"
      align="center"
      css={{ gap: '$4', maxWidth: '100%' }}
    >
      <Flex align="center" css={{ gap: '$3', overflow: 'hidden' }}>
        <Img
          src={collection?.image}
          css={{
            borderRadius: 8,
            objectFit: 'cover',
            height: 56,
            width: 56,
          }}
        />
        <Flex direction="column" css={{ gap: '$1', overflow: 'hidden' }}>
          <Text style="h6" ellipsify>
            {collection?.name}
          </Text>
          <Flex align="center" css={{ gap: '$1' }}>
            {mintEndTime ? (
              <Text style="subtitle2" color="subtle">
                Ends {mintEndTime}
              </Text>
            ) : null}
            {chain ? (
              <>
                {mintEndTime ? (
                  <Divider direction="vertical" css={{ maxHeight: 12 }} />
                ) : null}
                <ChainIcon chainId={chain.id} height={12} />
                <Text style="subtitle2" color="subtle" ellipsify>
                  {chain.name}
                </Text>
              </>
            ) : null}
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  )
}
