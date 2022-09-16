import React, { FC } from 'react'
import useAttributes from '../../hooks/useAttributes'
import { Box, Card, FormatCryptoCurrency, Grid, Text } from '../../primitives'
import { Trait } from './BidModalRenderer'

// SIDEBAR ATTRIBUTES
// http://localhost:3001/api/reservoir/collections/0x4d68e14cd7dec510c84326f54ee41f88e8fad59b/attributes/all/v1

// FILTERED TOKENS
// http://localhost:3001/api/reservoir/tokens/v5?limit=20&collection=0x4d68e14cd7dec510c84326f54ee41f88e8fad59b&includeTopBid=true&sortBy=floorAskPrice&attributes[Type]=Special

// TRAIT STATS (FLOOR)
// http://localhost:3001/api/reservoir/stats/v1?collection=0x4d68e14cd7dec510c84326f54ee41f88e8fad59b&attributes[Type]=Special

type Props = {
  attributes?: NonNullable<ReturnType<typeof useAttributes>['data']>
  setTrait: React.Dispatch<React.SetStateAction<Trait>>
}

const AttributeSelector: FC<Props> = ({ attributes, setTrait }) => {
  if (!attributes) return null

  return (
    <Box css={{ padding: 16 }}>
      {attributes.map(({ key, values }) => (
        <Box key={key} css={{ marginBottom: 24 }}>
          <Text
            style="subtitle1"
            as="div"
            css={{ marginBottom: 16, color: '#849DFF' }}
          >
            {key}
          </Text>
          <Grid
            css={{
              'grid-template-columns': 'repeat(2, minmax(0, 1fr))',
              gap: 8,
            }}
          >
            {values?.map(({ value }) => (
              <Card
                key={value}
                css={{
                  maxWidth: 145,
                  display: 'flex',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                }}
                as="button"
                onClick={() => setTrait({ key, value })}
              >
                <Grid css={{ gap: 4 }}>
                  <Text>{value}</Text>
                  <Text>%</Text>
                </Grid>
                <Grid css={{ gap: 4 }}>
                  <FormatCryptoCurrency amount={1} />
                  <Text>floor</Text>
                </Grid>
              </Card>
            ))}
          </Grid>
        </Box>
      ))}
    </Box>
  )
}

export default AttributeSelector
