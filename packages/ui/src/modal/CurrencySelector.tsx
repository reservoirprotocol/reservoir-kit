import { CSS } from '@stitches/react'
import React, { FC } from 'react'
import { CryptoCurrencyIcon, Flex, Select, Text } from '../primitives'
import { Currency } from '../types/Currency'

type Props = {
  triggerCss?: CSS
  valueCss?: CSS
  currencies: Currency[]
  currency: Currency
  setCurrency: (currency: Currency) => void
}

export const CurrencySelector: FC<Props> = ({
  triggerCss,
  valueCss,
  currencies,
  currency,
  setCurrency,
}) => {
  return (
    <Select
      trigger={
        <Select.Trigger
          css={{
            width: 'auto',
            p: 0,
            backgroundColor: 'transparent',
            ...triggerCss,
          }}
        >
          <Select.Value asChild>
            <Flex align="center" css={{ ...valueCss }}>
              <Flex align="center">
                <CryptoCurrencyIcon
                  address={currency.contract}
                  css={{ height: 18 }}
                />
                <Text style="subtitle1" color="subtle" css={{ ml: '$1' }}>
                  {currency.symbol}
                </Text>
              </Flex>
              <Select.DownIcon style={{ marginLeft: 6 }} />
            </Flex>
          </Select.Value>
        </Select.Trigger>
      }
      value={currency.contract}
      onValueChange={(value: string) => {
        const option = currencies.find((option) => option.contract == value)
        if (option) {
          setCurrency(option)
        }
      }}
    >
      {currencies.map((option) => (
        <Select.Item key={option.contract} value={option.contract}>
          <Select.ItemText>
            <Flex align="center" css={{ gap: '$1' }}>
              <CryptoCurrencyIcon
                address={option.contract}
                css={{ height: 18 }}
              />
              {option.symbol}
            </Flex>
          </Select.ItemText>
        </Select.Item>
      ))}
    </Select>
  )
}
