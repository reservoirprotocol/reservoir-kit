import React, { FC, useMemo } from 'react'
import { useTokens } from '../../hooks'
import { Dropdown, DropdownMenuItem } from '../../primitives/Dropdown'
import { Button, Flex, FormatCryptoCurrency, Text } from '../../primitives'
import { faEllipsis } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Currency } from '../../types/Currency'

type FloorDropdownProps = {
  token?: NonNullable<NonNullable<ReturnType<typeof useTokens>>['data']>[0]
  currency: Currency
  defaultCurrency?: Currency
  setPrice: React.Dispatch<React.SetStateAction<string>>
  setCurrency: (currency: Currency) => void
}

const FloorDropdown: FC<FloorDropdownProps> = ({
  token,
  currency,
  defaultCurrency,
  setPrice,
  setCurrency,
}) => {
  const highestTraitFloor = useMemo(() => {
    // @TODO: do we want to have a max size of attributes?
    if (token?.token?.attributes && token?.token?.attributes?.length < 200) {
      return Math.max(
        ...token.token.attributes.map((attr: any) =>
          Number(attr.floorAskPrice)
        ),
        0
      )
    }
  }, [token?.token?.attributes])

  const recentSalePrice = token?.token?.lastSale?.price
  const decimalSalePrice = token?.token?.lastSale?.price?.amount?.decimal
  const nativeSalePrice = token?.token?.lastSale?.price?.amount?.native
  const usdSalePrice = token?.token?.lastSale?.price?.amount?.usd

  const recentSale = useMemo(() => {
    // If currency matches recent sale currency, use decimal floor price
    if (
      currency.contract === recentSalePrice?.currency?.contract &&
      decimalSalePrice
    ) {
      return {
        address: currency.contract,
        amount: decimalSalePrice,
      }
    }

    // If currency is USDC, use usd recent sale price
    else if (currency.symbol === 'USDC' && usdSalePrice) {
      return {
        address: currency.contract,
        amount: usdSalePrice,
      }
    }
    // Fallback to native sale price
    else if (nativeSalePrice && defaultCurrency) {
      return {
        address: defaultCurrency.contract,
        amount: nativeSalePrice,
      }
    }
  }, [token, currency])

  if ((highestTraitFloor || recentSale) && defaultCurrency)
    return (
      <Dropdown
        contentProps={{ align: 'end', sideOffset: 10, style: { width: 265 } }}
        trigger={
          <Button
            color="secondary"
            size="none"
            css={{ height: 44, px: '$4', borderRadius: 8 }}
          >
            <Flex css={{ color: '$textColor' }}>
              <FontAwesomeIcon icon={faEllipsis} />
            </Flex>
          </Button>
        }
      >
        <Flex direction="column" css={{ width: '100%', gap: '$3' }}>
          {highestTraitFloor ? (
            <DropdownMenuItem
              onClick={() => {
                setPrice(highestTraitFloor.toString())
                setCurrency(defaultCurrency)
              }}
            >
              <Flex justify="between" align="center">
                <Text style="subtitle1">Highest Trait</Text>
                <FormatCryptoCurrency
                  amount={highestTraitFloor}
                  textStyle="h6"
                />
              </Flex>
            </DropdownMenuItem>
          ) : null}
          {recentSale ? (
            <DropdownMenuItem
              onClick={() => {
                setPrice(recentSale?.amount?.toString())
                if (currency.contract != recentSale.address) {
                  setCurrency(defaultCurrency)
                }
              }}
            >
              <Flex justify="between" align="center">
                <Text style="subtitle1">Recent Sale</Text>
                <FormatCryptoCurrency
                  address={recentSale?.address}
                  amount={recentSale?.amount}
                  textStyle="h6"
                />
              </Flex>
            </DropdownMenuItem>
          ) : null}
        </Flex>
      </Dropdown>
    )

  return null
}

export default FloorDropdown
