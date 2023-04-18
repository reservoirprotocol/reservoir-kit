import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { FC, useEffect, useState } from 'react'
import {
  Box,
  Flex,
  FormatCryptoCurrency,
  Grid,
  Input,
  Text,
} from '../../primitives'
import ScrollArea from '../../primitives/ScrollArea'
import { Trait } from './BidModalRenderer'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { useAttributes } from '../../hooks'

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
        const values = attribute.values?.filter(({ value }) =>
          value.toLowerCase().includes(query.toLowerCase())
        )
        if (values && values.length > 0) {
          results?.push({
            ...attribute,
            values: values,
          })
        }
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
        borderRadius: '$space$2',
        backgroundColor: '$popoverBackground',
      }}
    >
      <Input
        css={{ marginBottom: '$4', padding: '$space$4 $space$4 $space$4 48px' }}
        placeholder="Filter attribute"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        iconCss={{ top: '26px', color: '$neutralText' }}
        icon={
          <FontAwesomeIcon icon={faMagnifyingGlass} width={16} height={16} />
        }
      />
      <ScrollArea css={{ minWidth: '80vw', '@bp1': { minWidth: 468 } }}>
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
                {values?.map(({ value, count, floorAskPrice }) => (
                  <Box
                    key={value}
                    css={{
                      display: 'grid',
                      alignContent: 'space-between',
                      cursor: 'pointer',
                      backgroundColor: '$contentBackground',
                      borderRadius: '$space$2',
                      $$shadowColor: '$colors$gray7',
                      boxShadow: 'box-shadow: 0px 2px 16px $$shadowColor',
                      border: '1px solid $borderColor',
                      width: '100%',
                      padding: '12px 16px',
                    }}
                    as="button"
                    onClick={() => {
                      setTrait({ key, value, floorAskPrice })
                      setOpen(false)
                    }}
                  >
                    <Flex
                      justify="between"
                      css={{
                        gap: '$2',
                        marginBottom: '$1',
                      }}
                    >
                      <Text
                        css={{
                          maxWidth: 85,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          textAlign: 'start',
                        }}
                        style="subtitle2"
                      >
                        {value}
                      </Text>
                      <Box css={{ flex: 'none' }}>
                        <FormatCryptoCurrency
                          amount={floorAskPrice}
                          logoWidth={10}
                          maximumFractionDigits={1}
                          textStyle="subtitle2"
                        />
                      </Box>
                    </Flex>
                    <Flex justify="between" css={{ gap: '$2' }}>
                      <Text style="body3" color="subtle">
                        {count && tokenCount
                          ? `${Math.round((count / tokenCount) * 100)}%`
                          : '-'}
                      </Text>
                      <Text style="body3" color="subtle">
                        floor
                      </Text>
                    </Flex>
                  </Box>
                ))}
              </Grid>
            </Box>
          )
        })}
      </ScrollArea>
    </Box>
  )
}

export default AttributeSelector
