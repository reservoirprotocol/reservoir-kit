import React from 'react'

import { Flex, Box, Input, FormatCurrency, Text, FormatCryptoCurrency } from '.'

import { CryptoCurrencyIcon } from '.'
import { useCollections, useListings } from '../hooks'

type MarketPlaceInputProps = {
  price: number | undefined
  chainId?: number
  collection?: NonNullable<ReturnType<typeof useCollections>['data']>[0]
  currency: NonNullable<
    NonNullable<ReturnType<typeof useListings>['data']>[0]['price']
  >['currency']
  usdPrice?: number | null
  quantity?: number
  onChange: (e: any) => void
  onBlur: (e: any) => void
}

const PriceInput = ({
  chainId,
  price,
  collection,
  currency,
  usdPrice,
  quantity = 1,
  onChange,
  onBlur,
  ...props
}: MarketPlaceInputProps) => {
  let profit =
    (1 - (collection?.royalties?.bps || 0) * 0.0001) * (price || 0) * quantity
  100

  return (
    <Flex {...props} align="center">
      <Flex align="center">
        <Box
          css={{
            width: 'auto',
            height: 20,
          }}
        >
          <CryptoCurrencyIcon
            chainId={chainId}
            css={{ height: 18 }}
            address={currency?.contract as string}
          />
        </Box>

        <Text style="body1" color="subtle" css={{ ml: '$1', mr: '$4' }} as="p">
          {currency?.symbol}
        </Text>
      </Flex>
      <Box css={{ flex: 1 }}>
        <Input
          type="number"
          value={price}
          onChange={onChange}
          onBlur={onBlur}
          placeholder="Enter a listing price"
        />
      </Box>
      <Flex direction="column" align="end" css={{ ml: '$3' }}>
        <FormatCryptoCurrency
          chainId={chainId}
          amount={profit}
          address={currency?.contract}
          decimals={currency?.decimals}
          symbol={currency?.symbol}
          textStyle="h6"
          logoWidth={18}
        />
        <FormatCurrency
          amount={profit * (usdPrice || 0)}
          style="subtitle3"
          color="subtle"
        />
      </Flex>
    </Flex>
  )
}

export default PriceInput
