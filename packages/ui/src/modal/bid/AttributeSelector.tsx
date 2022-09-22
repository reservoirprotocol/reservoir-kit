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

type Props = {
  attributes?: NonNullable<ReturnType<typeof useAttributes>['data']>
  tokenCount?: number
  setTrait: React.Dispatch<React.SetStateAction<Trait>>
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const AttributeSelector: FC<Props> = ({
  attributes,
  setTrait,
  setOpen,
  tokenCount,
}) => {
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
    <Box
      css={{
        maxWidth: 500,
        zIndex: 1000,
        padding: '$4',
        overflowY: 'auto',
        borderRadius: 8,
        backgroundColor: '$popoverBackground',
      }}
    >
      <Input
        css={{ marginBottom: '$4', padding: '16px 16px 16px 48px' }}
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
            <Box key={key} css={{ paddingRight: '$4', marginBottom: 24 }}>
              <Text
                style="subtitle1"
                color="accent"
                as="div"
                css={{ marginBottom: '$4' }}
              >
                {key}
              </Text>
              <Grid
                css={{
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: '$2',
                  '@bp1': {
                    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                  },
                }}
              >
                {values?.map(({ value, count }) => (
                  <Card
                    key={value}
                    css={{
                      display: 'grid',
                      cursor: 'pointer',
                    }}
                    as="button"
                    onClick={() => {
                      setTrait({ key, value })
                      setOpen(false)
                    }}
                  >
                    <Flex
                      css={{
                        justifyContent: 'space-between',
                        gap: '$2',
                        marginBottom: '$1',
                      }}
                    >
                      <Text
                        css={{
                          maxWidth: 85,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          textAlign: 'start',
                        }}
                        title={value}
                        style="subtitle2"
                      >
                        {value}
                      </Text>
                      <Box css={{ flex: 'none' }}>
                        <FormatCryptoCurrency
                          amount={1.345397}
                          logoWidth={7}
                          maximumFractionDigits={1}
                          textStyle="subtitle2"
                        />
                      </Box>
                    </Flex>
                    <Flex css={{ justifyContent: 'space-between', gap: '$2' }}>
                      <Text style="body2">
                        {count && tokenCount
                          ? `${Math.floor((count / tokenCount) * 100)}%`
                          : '-'}
                      </Text>
                      <Text style="body2">floor</Text>
                    </Flex>
                  </Card>
                ))}
              </Grid>
            </Box>
          )
        })}
      </GeneralizedScrollArea>
    </Box>
  )
}

export default AttributeSelector
