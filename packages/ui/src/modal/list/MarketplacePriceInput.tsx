import React from 'react'

import {
  Flex,
  Box,
  Input,
  FormatCurrency,
  FormatEth,
  Text,
} from '../../primitives'

import { EthLogo } from '../../primitives/FormatEth'
import { Marketplace } from '../../hooks/useMarketplaces'

type MarketPlaceInputProps = {
  marketplace: Marketplace
  ethUsdPrice?: number | null
  onChange: (e: any) => void
  onBlur: (e: any) => void
}

const MarketplacePriceInput = ({
  marketplace,
  ethUsdPrice,
  onChange,
  onBlur,
  ...props
}: MarketPlaceInputProps) => {
  let profit = (1 - (marketplace.feeBps || 0)) * Number(marketplace.truePrice)

  return (
    <Flex {...props} align="center">
      <Box css={{ mr: '$2' }}>
        <img
          src={marketplace.imageUrl}
          style={{ height: 32, width: 32, borderRadius: 4 }}
        />
      </Box>
      <Flex align="center">
        <EthLogo width={20} />
        <Text style="body1" color="subtle" css={{ ml: '$1', mr: '$4' }} as="p">
          ETH
        </Text>
      </Flex>
      <Box css={{ flex: 1 }}>
        <Input
          type="number"
          value={marketplace.price}
          onChange={onChange}
          onBlur={onBlur}
        />
      </Box>
      <Flex direction="column" align="end" css={{ ml: '$3' }}>
        <FormatEth amount={profit} textStyle="h6" logoWidth={12} />
        <FormatCurrency
          amount={profit * (ethUsdPrice || 1000)}
          style="subtitle2"
          color="subtle"
        />
      </Flex>
    </Flex>
  )
}

export default MarketplacePriceInput
