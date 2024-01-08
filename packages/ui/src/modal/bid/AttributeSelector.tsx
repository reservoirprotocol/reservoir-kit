import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { FC, useEffect, useState } from 'react'
import { Flex, FormatCryptoCurrency, Input, Text } from '../../primitives'
import ScrollArea from '../../primitives/ScrollArea'
import { Trait } from './BidModalRenderer'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { useAttributes } from '../../hooks'

type Props = {
  attributes?: NonNullable<ReturnType<typeof useAttributes>['data']>
  tokenCount?: number
  chainId?: number
  setTrait: React.Dispatch<React.SetStateAction<Trait>>
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const AttributeSelector: FC<Props> = ({
  attributes,
  chainId,
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
    <Flex
      direction="column"
      css={{
        width: '100%',
        maxWidth: 484,
        maxHeight: 250,
        '@bp1': { maxHeight: 500 },
        zIndex: 1000,
        padding: '$4',
        overflowY: 'auto',
        borderRadius: '$space$2',
        backgroundColor: '$contentBackground',
        border: '1px solid $borderColor',
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
      <Flex
        justify="between"
        align="center"
        css={{
          borderBottom: '1px solid $borderColor',
          pb: '$2',
          mb: '$4',
          width: '100%',
        }}
      >
        <Text color="subtle" style="subtitle3">
          Trait
        </Text>
        <Text color="subtle" style="subtitle3">
          Floor
        </Text>
      </Flex>
      <ScrollArea
        css={{ width: '100%', minWidth: '80vw', '@bp1': { minWidth: 468 } }}
      >
        {results?.map(({ key, values }) => {
          if (values?.length === 0) return null

          return (
            <Flex
              direction="column"
              key={key}
              css={{ gap: '$2', marginBottom: '$3', width: '100%' }}
            >
              <Text style="subtitle2" color="accent" as="div">
                {key}
              </Text>
              <Flex direction="column" css={{ width: '100%' }}>
                {values?.map(({ value, count, floorAskPrice }) => (
                  <Flex
                    key={value}
                    justify="between"
                    align="center"
                    css={{
                      cursor: 'pointer',
                      borderRadius: '$space$2',
                      width: '100%',
                      py: '$3',
                      backgroundColor: '$contentBackground',
                      transition: 'background-color 0.25s ease-in-out',
                      '&:hover': {
                        backgroundColor: '$neutralBgHover',
                      },
                    }}
                    as="button"
                    onClick={() => {
                      setTrait({
                        key,
                        value,
                        floorAskPrice: floorAskPrice?.amount?.decimal,
                      })
                      setOpen(false)
                    }}
                  >
                    <Flex
                      justify="between"
                      css={{
                        gap: '$2',
                      }}
                    >
                      <Text ellipsify style="subtitle2">
                        {value}
                      </Text>
                      <Text style="body2" color="subtle">
                        {count && tokenCount
                          ? `${Math.round((count / tokenCount) * 100)}%`
                          : '-'}
                      </Text>
                    </Flex>

                    <FormatCryptoCurrency
                      chainId={chainId}
                      amount={floorAskPrice?.amount?.decimal}
                      logoWidth={10}
                      maximumFractionDigits={1}
                      textStyle="subtitle2"
                      css={{ pr: '$4' }}
                    />
                  </Flex>
                ))}
              </Flex>
            </Flex>
          )
        })}
      </ScrollArea>
    </Flex>
  )
}

export default AttributeSelector
