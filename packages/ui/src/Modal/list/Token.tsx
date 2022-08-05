import { useTokenDetails, useCollection } from '../../hooks'
import React, { FC } from 'react'
import { styled } from '../../../stitches.config'
import { Box, Text } from '../../primitives'

const Img = styled('img', {
  width: '100%',
  '@bp1': {
    height: 150,
    width: 150,
  },
  borderRadius: '$borderRadius',
})

type Props = {
  token?: NonNullable<
    NonNullable<ReturnType<typeof useTokenDetails>>['tokens']
  >['0']
  collection: ReturnType<typeof useCollection>['collection']
}

const Token: FC<Props> = ({ token, collection }) => {
  const img = token?.token?.image
    ? token.token.image
    : (collection?.metadata?.imageUrl as string)
  return (
    <Box
      css={{
        mr: '$4',
        width: 120,
        '@bp1': {
          mr: 0,
          width: '100%',
        },
      }}
    >
      <Text
        style="subtitle2"
        color="subtle"
        css={{ mb: '$1', display: 'block' }}
      >
        Item
      </Text>
      <Img
        src={img}
        css={{
          mb: '$2',
          visibility: !img || img.length === 0 ? 'hidden' : 'visible',
        }}
      />
      <Text style="h6" css={{ flex: 1 }} as="h6" ellipsify>
        {token?.token?.name || `#${token?.token?.tokenId}`}
      </Text>
      <Box>
        <Text style="subtitle2" color="subtle" as="p" ellipsify>
          {token?.token?.collection?.name}
        </Text>
      </Box>
    </Box>
  )
}

export default Token
