import React from 'react'

import { Box, Text, Flex, Switch } from '../../primitives'
import { Market } from './ListModalRenderer'

type MarketPlaceToggleProps = {
  marketplace: Market
  onSelection: () => void
}

const MarketplaceToggle = ({
  marketplace,
  onSelection,
  ...props
}: MarketPlaceToggleProps) => (
  <Flex {...props} align="center">
    <Box css={{ mr: '$2' }}>
      <img
        src={marketplace.imgURL}
        style={{ height: 32, width: 32, borderRadius: 4 }}
      />
    </Box>
    <Text style="body3" css={{ flex: 1 }}>
      {marketplace.name}
    </Text>
    <Text style="subtitle2" color="subtle" css={{ mr: '$2' }}>
      Marketplace fee: {marketplace.fee * 100}%
    </Text>
    <Switch checked={marketplace.isSelected} onCheckedChange={onSelection} />
  </Flex>
)

export default MarketplaceToggle
