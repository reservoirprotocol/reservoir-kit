import React, { FC } from 'react'
import { Flex, Img, Text } from '../../primitives'
import { useCollections, useTokens } from '../../hooks'

type Props = {
  token?: NonNullable<ReturnType<typeof useTokens>['data']>[0]
  collection?: NonNullable<ReturnType<typeof useCollections>['data']>[0]
}

export const TokenInfo: FC<Props> = ({ token, collection }) => {
  return (
    <Flex justify="between" align="center" css={{ gap: '$4' }}>
      <Flex align="center" css={{ gap: '$3' }}>
        <Img
          src={token?.token?.image || token?.token?.collection?.image}
          css={{
            borderRadius: 8,
            objectFit: 'cover',
            height: 56,
            width: 56,
          }}
        />
        <Flex direction="column" css={{ gap: '$1' }}>
          <Text style="h6">
            {token?.token?.name || `#${token?.token?.tokenId}`}
          </Text>
          <Text style="body3">{collection?.name}</Text>
        </Flex>
      </Flex>
    </Flex>
  )
}
