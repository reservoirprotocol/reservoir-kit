import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { FC, useEffect, useState } from 'react'
import useAttributes from '../../hooks/useAttributes'
import {
  Box,
  Card,
  Flex,
  FormatCryptoCurrency,
  Grid,
  Input,
  Text,
} from '../../primitives'
import { GeneralizedScrollArea } from '../../primitives/ScrollArea'
import { Trait } from './BidModalRenderer'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'

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
  const [results, setResults] = useState<Props['attributes']>([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (query === '') {
      setResults(attributes)
    } else {
      let results: Props['attributes'] = []
      attributes?.forEach((attribute) => {
        results?.push({
          ...attribute,
          values: attribute.values?.filter(({ value }) =>
            value.toLowerCase().includes(query.toLowerCase())
          ),
        })
      })
      setResults(results ? [...results] : [])
    }
  }, [query])

  if (!attributes) return null

  return (
    <>
      <Input
        css={{ marginBottom: 16, padding: '16px 16px 16px 48px' }}
        placeholder="Filter attribute"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        iconCss={{ top: '26px', color: '$neutralText' }}
        icon={
          <FontAwesomeIcon icon={faMagnifyingGlass} width={16} height={16} />
        }
      />
      <GeneralizedScrollArea>
        {results?.map(({ key, values }) => {
          if (values?.length === 0) return null

          return (
            <Box key={key} css={{ paddingRight: 16, marginBottom: 24 }}>
              <Text
                style="subtitle1"
                color="accent"
                as="div"
                css={{ marginBottom: 16 }}
              >
                {key}
              </Text>
              <Grid
                css={{
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: 8,
                  '@bp1': {
                    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                  },
                }}
              >
                {values?.map(({ value }) => (
                  <Card
                    key={value}
                    css={{
                      display: 'grid',
                      cursor: 'pointer',
                    }}
                    as="button"
                    onClick={() => setTrait({ key, value })}
                  >
                    <Flex css={{ justifyContent: 'space-between', gap: 8 }}>
                      <Text
                        css={{
                          maxWidth: 90,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          textAlign: 'start',
                        }}
                      >
                        {value}
                      </Text>
                      <FormatCryptoCurrency
                        amount={1.345397}
                        maximumFractionDigits={1}
                      />
                    </Flex>
                    <Flex css={{ justifyContent: 'space-between', gap: 8 }}>
                      <Text>%</Text>
                      <Text>floor</Text>
                    </Flex>
                  </Card>
                ))}
              </Grid>
            </Box>
          )
        })}
      </GeneralizedScrollArea>
    </>
  )
}

export default AttributeSelector
