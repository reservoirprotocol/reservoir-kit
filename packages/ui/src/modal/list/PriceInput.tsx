import React from 'react'
import { Flex, Box, Input, Text } from '../../primitives'
import { Currency } from '../../types/Currency'
import { CryptoCurrencyIcon } from '../../primitives'
import { CurrencySelector } from '../CurrencySelector'

type MarketPlaceInputProps = {
  price: string
  currency: Currency
  currencies: Currency[]
  chainId?: number
  setCurrency: (currency: Currency) => void
  onChange: (e: any) => void
  onBlur: (e: any) => void
}

const PriceInput = ({
  price,
  currency,
  currencies,
  chainId,
  setCurrency,
  onChange,
  onBlur,
  ...props
}: MarketPlaceInputProps) => {
  return (
    <Flex {...props} align="center">
      <Box css={{ flex: 1 }}>
        <Input
          type="number"
          value={price}
          onChange={onChange}
          onBlur={onBlur}
          placeholder="Enter a listing price"
        />
      </Box>
      <>
        {currencies.length > 1 ? (
          <CurrencySelector
            chainId={chainId}
            currency={currency}
            currencies={currencies}
            setCurrency={setCurrency}
            triggerCss={{
              mr: '$3',
              backgroundColor: '$neutralBgActive',
              borderRadius: 4,
              p: '$3',
              width: 120,
            }}
            valueCss={{ justifyContent: 'space-between', width: '100%' }}
          />
        ) : (
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
                address={currency.contract}
              />
            </Box>

            <Text
              style="body1"
              color="subtle"
              css={{ ml: '$1', mr: '$4' }}
              as="p"
            >
              {currency.symbol}
            </Text>
          </Flex>
        )}
      </>
    </Flex>
  )
}

export default PriceInput
