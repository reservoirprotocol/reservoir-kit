import React, { FC, useMemo } from 'react'
import { Flex, Img, Text } from '../../primitives'
import { useCollections, useTimeSince } from '../../hooks'
import optimizeImage from '../../lib/optimizeImage'
import { CollectModalContentMode } from './CollectModalRenderer'

type Props = {
  collection?: NonNullable<ReturnType<typeof useCollections>['data']>[0]
  mode?: CollectModalContentMode
}

export const CollectionInfo: FC<Props> = ({ collection, mode }) => {
  const mintData =
    mode === 'mint'
      ? collection?.mintStages?.find((stage) => stage.kind === 'public')
      : undefined

  const mintEndTime =
    mode === 'mint' ? useTimeSince(mintData?.endTime) : undefined

  const sampleImages = useMemo(() => {
    return collection?.sampleImages?.map((image) => optimizeImage(image, 250))
  }, [collection?.sampleImages])

  return (
    <Flex justify="between" align="center" css={{ gap: '$4' }}>
      <Flex align="center" css={{ gap: '$3' }}>
        <Img
          src={collection?.image}
          css={{
            borderRadius: 8,
            objectFit: 'cover',
            height: 56,
            width: 56,
          }}
        />
        <Flex direction="column" css={{ gap: '$1' }}>
          <Text style="h6">{collection?.name}</Text>
          <Flex align="center" css={{ gap: '$2' }}>
            {mintEndTime ? (
              <Text style="body3" color="subtle">
                Ends {mintEndTime}
              </Text>
            ) : null}
          </Flex>
        </Flex>
      </Flex>
      <Flex>
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
