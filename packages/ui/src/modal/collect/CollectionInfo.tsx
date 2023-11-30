import React, { FC, useMemo } from 'react'
import { ChainIcon, Flex, Img, Text } from '../../primitives'
import { useCollections } from '../../hooks'
import optimizeImage from '../../lib/optimizeImage'
import { ReservoirChain } from '@reservoir0x/reservoir-sdk'

type Props = {
  collection?: NonNullable<ReturnType<typeof useCollections>['data']>[0]
  chain?: ReservoirChain | null
}

export const CollectionInfo: FC<Props> = ({ collection, chain }) => {
  const sampleImages = useMemo(() => {
    return collection?.sampleImages?.map((image) => optimizeImage(image, 250))
  }, [collection?.sampleImages])

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
          {chain ? (
            <Flex align="center" css={{ gap: '$1' }}>
              <ChainIcon chainId={chain.id} height={12} />
              <Text style="subtitle2" color="subtle" ellipsify>
                {chain.name}
              </Text>
            </Flex>
          ) : null}
        </Flex>
      </Flex>
      <Flex css={{ flexShrink: 0 }}>
        {sampleImages?.map((image, index) => (
          <Img
            src={image}
            key={index}
            css={{
              position: 'relative',
              borderRadius: 8,
              objectFit: 'cover',
              height: 42,
              width: 42,
              filter: 'drop-shadow(4px 0px 4px rgba(0, 0, 0, 0.25))',
              marginLeft: index > 0 ? -30 : 0,
              zIndex: -index,
            }}
          />
        ))}
      </Flex>
    </Flex>
  )
}
