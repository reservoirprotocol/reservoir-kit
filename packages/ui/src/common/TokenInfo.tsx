import React, { FC } from 'react'
import { ChainIcon, Divider, Flex, Img, Text } from '../primitives'
import { useCollections, useTokens } from '../hooks'
import { ReservoirChain } from '@reservoir0x/reservoir-sdk'
import { CSS } from '@stitches/react'

type Props = {
  token?: NonNullable<ReturnType<typeof useTokens>['data']>[0]
  collection?: NonNullable<ReturnType<typeof useCollections>['data']>[0]
  chain?: ReservoirChain | null
  css?: CSS
}

export const TokenInfo: FC<Props> = ({ token, collection, chain, css }) => {
  return (
    <Flex justify="between" align="center" css={{ gap: '$4', ...css }}>
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
          <Flex align="center" css={{ gap: '$1' }}>
            <Text style="subtitle2" color="subtle">
              {collection?.name}
            </Text>
            {chain ? (
              <>
                <Divider direction="vertical" />
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
