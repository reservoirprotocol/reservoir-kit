import { useTokens, useCollections } from '../../hooks'
import React, { FC } from 'react'
import { styled } from '../../../stitches.config'
import { Box, ChainIcon, Flex, Text } from '../../primitives'
import optimizeImage from '../../lib/optimizeImage'
import { ReservoirChain } from '@reservoir0x/reservoir-sdk'

const Img = styled('img', {
  width: '100%',
  '@bp1': {
    height: 56,
    width: 56,
  },
  borderRadius: '$borderRadius',
})

type Props = {
  token?: NonNullable<NonNullable<ReturnType<typeof useTokens>>['data']>['0']
  collection: NonNullable<ReturnType<typeof useCollections>['data']>[0]
  chain?: ReservoirChain | null
}

const TokenInfo: FC<Props> = ({ token, collection, chain }) => {
  const img = token?.token?.imageSmall
    ? token.token.imageSmall
    : optimizeImage(collection?.image as string, 250)

  return (
    <Flex
      css={{
        mr: '$4',
        marginBottom: '$4',
        width: 120,
        gap: '$2',
      }}
    >
      <Img
        src={img}
        css={{
          mb: '$2',
          visibility: !img || img.length === 0 ? 'hidden' : 'visible',
          objectFit: 'cover',
        }}
      />
      <Flex direction="column">
        <Text style="h6" css={{ flex: 1 }} as="h6" ellipsify>
          {token?.token
            ? token.token.name || `#${token.token.tokenId}`
            : collection?.name}
        </Text>
        {token ? (
          <Box css={{ mt: '$1' }}>
            <Text style="subtitle3" color="subtle" as="p" ellipsify>
              {token?.token?.collection?.name}
            </Text>
            {chain?.id && chain?.name ? (
              <Flex align="center" css={{ mt: '$1' }}>
                <ChainIcon
                  chainId={chain?.id}
                  css={{ marginRight: 5 }}
                  height={12}
                />
                <Text style="subtitle3" color="subtle" ellipsify>
                  {chain?.name}
                </Text>
              </Flex>
            ) : null}
          </Box>
        ) : chain?.id && chain?.name ? (
          <Flex align="center" css={{ mt: '$1' }}>
            <ChainIcon
              chainId={chain?.id}
              css={{ marginRight: 5 }}
              height={12}
            />
            <Text style="subtitle3" color="subtle" ellipsify>
              {chain?.name}
            </Text>
          </Flex>
        ) : null}
      </Flex>
    </Flex>
  )
}

export default TokenInfo
