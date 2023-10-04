import React, { FC } from 'react'
import { Flex, Img, Text } from '../../primitives'
import { useCollections, useTokens } from '../../hooks'
import { ReservoirChain } from '@reservoir0x/reservoir-sdk'

type ListCheckoutProps = {
  collection?: NonNullable<ReturnType<typeof useCollections>['data']>[0]
  token?: NonNullable<ReturnType<typeof useTokens>['data']>[0]
  chain?: ReservoirChain | null
}

const ListCheckout: FC<ListCheckoutProps> = ({ collection, token, chain }) => {
  return (
    <Flex css={{ p: '$4' }}>
      <Flex align="center" css={{ gap: '$3' }}>
        <Img
          src={collection?.image}
          alt={collection?.name}
          css={{ width: 56, height: 56, borderRadius: 4, aspectRatio: '1/1' }}
        />
        <Flex direction="column" css={{ gap: 2 }}>
          <Text style="h6" ellipsify>
            {token?.token?.tokenId
              ? `#${token?.token?.tokenId}`
              : token?.token?.name}
          </Text>
          <Flex align="center" css={{ gap: '$1' }}>
            <Text style="subtitle2" color="subtle" ellipsify>
              {collection?.name}
            </Text>
            {chain ? (
              <>
                <Text style="subtitle3" css={{ color: '$neutralLine' }}>
                  |
                </Text>
                {/* @TODO: replace chain.id with chain.name */}
                <Text style="subtitle2" color="subtle" ellipsify>
                  {chain.id}
                </Text>
              </>
            ) : null}
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  )
}

export default ListCheckout
