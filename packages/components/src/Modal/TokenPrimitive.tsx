import { styled } from '../../stitches.config'
import React, { FC } from 'react'
import { Box } from '../primitives/Box'
import { Flex } from '../primitives/Flex'
import FormatEth from '../primitives/FormatEth'
import { Text } from '../primitives/Text'
import { Grid } from '../primitives/Grid'
import { formatDollar } from '../lib/numbers'

type Props = {
  img: string
  name: string
  collection: string
  source?: string
  price?: number
  usdPrice?: number
  royalty?: number
}

const Img = styled('img', {
  height: 56,
  width: 56,
})

export const TokenPrimitive: FC<Props> = ({
  img,
  name,
  collection,
  royalty,
  source,
  usdPrice,
  price,
}) => {
  return (
    <Box
      css={{
        p: 16,
        backgroundColor: '$slate3',
      }}
    >
      <Text style="subtitle2" css={{ mb: 10, color: '$slate11' }}>
        Item
      </Text>
      <Flex css={{ justifyContent: 'space-between' }}>
        <Flex css={{ alignItems: 'center', gap: 8 }}>
          <Img
            src={img}
            alt={name}
            css={{ borderRadius: 4, overflow: 'hidden' }}
          />
          <Grid css={{ rowGap: 2 }}>
            <Text style="h6">{name}</Text>
            <Text style="body2">{collection}</Text>
            {royalty && <Text style="tiny">{royalty}% royalty</Text>}
          </Grid>
        </Flex>
        <Grid css={{ justifyItems: 'end', rowGap: 4 }}>
          {source && (
            <Img
              src={source}
              alt="source"
              css={{ w: 17, h: 17, borderRadius: 99999, overflow: 'hidden' }}
            />
          )}
          <FormatEth amount={price} />
          {usdPrice && <Text style="tiny">{formatDollar(usdPrice)}</Text>}
        </Grid>
      </Flex>
    </Box>
  )
}
