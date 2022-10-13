import React, { FC } from 'react'
import { useMediaQuery } from '../../hooks'
import { Flex, Text } from '../../primitives'

type Props = {
  attributeKey?: string
  attributeValue?: string
}

const SelectedAttribute: FC<Props> = ({ attributeKey, attributeValue }) => {
  const isMobile = useMediaQuery('(max-width: 520px)')
  if (!attributeKey || !attributeValue) return null
  return (
    <Flex
      css={{
        padding: '$2',
        borderRadius: 4,
        backgroundColor: '$neutralBgHover',
        marginBottom: '$4',
        overflow: 'hidden',
        gap: '$1',
        justifyContent: 'space-between',
        maxWidth: '100%',
        '@bp1': {
          justifyContent: 'start',
          width: 'fit-content',
        },
      }}
    >
      <Text color="accent" style="subtitle2">
        {attributeKey}
        {`${isMobile ? '' : ':'}`}
      </Text>
      <Text
        style="subtitle2"
        css={{
          maxWidth: 200,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {attributeValue}
      </Text>
    </Flex>
  )
}

export default SelectedAttribute
