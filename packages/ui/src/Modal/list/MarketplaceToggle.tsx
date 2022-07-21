import React from 'react'

import { Box, Text, Flex, Switch } from '../../primitives'

type MarketPlaceToggleProps = {
  name: string
  imgURL: string
  fee: number
  isSelected: boolean
  onSelection: () => void
}

const MarketplaceToggle = ({
  name,
  imgURL,
  fee,
  isSelected,
  onSelection,
  ...props
}: MarketPlaceToggleProps) => (
  <Flex {...props} align="center">
    <Box css={{ mr: '$2' }}>
      <img src={imgURL} style={{ height: 32, width: 32, borderRadius: 4 }} />
    </Box>
    <Text style="body3" css={{ flex: 1 }}>
      {name}
    </Text>
    <Text style="subtitle2" color="subtle" css={{ mr: '$2' }}>
      Marketplace fee: {fee * 100}%
    </Text>
    <Switch checked={isSelected} onCheckedChange={onSelection} />
  </Flex>
)

export default MarketplaceToggle
