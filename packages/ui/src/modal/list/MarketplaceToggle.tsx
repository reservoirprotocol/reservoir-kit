import React from 'react'

import { Box, Text, Flex, Switch } from '../../primitives'
import { Marketplace } from '../../hooks/useMarketplaces'

type MarketPlaceToggleProps = {
  marketplace: Marketplace
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
        src={marketplace.imageUrl}
        style={{ height: 32, width: 32, borderRadius: 4 }}
      />
    </Box>
    <Text style="body2" css={{ flex: 1 }}>
      {marketplace.name}
    </Text>
    <Text style="subtitle2" color="subtle" css={{ mr: '$2' }}>
      Marketplace fee: {marketplace.fee?.percent}%
    </Text>
    <Switch checked={marketplace.isSelected} onCheckedChange={onSelection} />
  </Flex>
)

export default MarketplaceToggle
