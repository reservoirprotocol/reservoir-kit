import React, { FC } from 'react'
import { Collapsible } from '../../primitives/Collapsible'
import {
  Button,
  Divider,
  Flex,
  FormatCryptoCurrency,
  FormatCurrency,
  Text,
} from '../../primitives'
import { Currency } from '../../types/Currency'
import { Marketplace } from '../../hooks/useMarketplaces'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown } from '@fortawesome/free-solid-svg-icons'
import InfoTooltip from '../../primitives/InfoTooltip'

type PriceBreakdownProps = {
  price: string
  usdPrice: number
  currency: Currency
  quantity: number
  royaltyBps?: number
  marketplace?: Marketplace
}

const PriceBreakdown: FC<PriceBreakdownProps> = ({
  price,
  usdPrice,
  currency,
  quantity,
  royaltyBps,
  marketplace,
}) => {
  let profit =
    (1 - (marketplace?.fee?.percent || 0) / 100 - (royaltyBps || 0) * 0.0001) *
    Number(price) *
    quantity
  100

  if (Number(price) > 0 && (marketplace?.fee?.percent || royaltyBps)) {
    return (
      <Collapsible
        style={{ width: '100%', borderRadius: 0, overflow: 'visible' }}
        trigger={
          <Button
            color="ghost"
            size="none"
            css={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'start',
              '& > div > span > svg': {
                transition: '.3s',
              },
              '&[data-state="open"] > div > span > svg': {
                transform: 'rotate(180deg)',
              },
              $$focusColor: '$colors$accentBorderHover',
              '&:focus-visible': { boxShadow: '0 0 0 2px $$focusColor' },
            }}
          >
            <Flex align="center" css={{ gap: '$3' }}>
              <Text style="h6">Total Earnings</Text>
              <Text
                css={{
                  color: '$neutralSolidHover',
                }}
              >
                <FontAwesomeIcon icon={faChevronDown} width={16} height={16} />
              </Text>
            </Flex>
            <Flex direction="column" align="end">
              <FormatCryptoCurrency
                amount={profit}
                address={currency.contract}
                symbol={currency.symbol}
                textStyle="h6"
              />
              {usdPrice ? (
                <FormatCurrency
                  amount={profit * (usdPrice || 0)}
                  style="subtitle3"
                  color="subtle"
                />
              ) : null}
            </Flex>
          </Button>
        }
      >
        <Flex direction="column" css={{ gap: '$2', mt: '$3' }}>
          <Flex justify="between" align="center">
            <Text style="subtitle2" color="subtle">
              Total Listing Value
            </Text>
            <FormatCryptoCurrency
              amount={Number(price) * quantity}
              address={currency.contract}
              symbol={currency.symbol}
              textStyle="subtitle2"
              textColor="subtle"
            />
          </Flex>
          {royaltyBps ? (
            <Flex justify="between" align="center">
              <Flex align="center" css={{ gap: '$2' }}>
                <Text style="subtitle2" color="subtle">
                  Creator Royalties
                </Text>
                <InfoTooltip
                  side="right"
                  width={200}
                  content={
                    'A fee on every order that goes to the collection creator.'
                  }
                />
              </Flex>

              <Flex align="center" css={{ gap: '$1' }}>
                <Text style="subtitle2" color="subtle">
                  -
                </Text>
                <FormatCryptoCurrency
                  amount={quantity * Number(price) * (royaltyBps || 0) * 0.0001}
                  address={currency.contract}
                  symbol={currency.symbol}
                  textStyle="subtitle2"
                  textColor="subtle"
                />
              </Flex>
            </Flex>
          ) : null}
          {marketplace?.fee?.bps ? (
            <Flex justify="between" align="center">
              <Text style="subtitle2" color="subtle">
                {marketplace?.name || 'Marketplace'} Fee
              </Text>

              <Flex align="center" css={{ gap: '$1' }}>
                <Text style="subtitle2" color="subtle">
                  -
                </Text>
                <FormatCryptoCurrency
                  amount={
                    quantity * Number(price) * (marketplace?.fee?.percent / 100)
                  }
                  address={currency.contract}
                  symbol={currency.symbol}
                  textStyle="subtitle2"
                  textColor="subtle"
                />
              </Flex>
            </Flex>
          ) : null}
          <Divider />
          <Flex justify="between" align="center">
            <Text style="subtitle2" color="subtle">
              Total Earnings
            </Text>
            <FormatCryptoCurrency
              amount={profit}
              address={currency.contract}
              symbol={currency.symbol}
              textStyle="subtitle2"
              textColor="subtle"
            />
          </Flex>
        </Flex>
      </Collapsible>
    )
  }

  return (
    <Flex justify="between" align="start" css={{ width: '100%' }}>
      <Text style="h6">Total Earnings</Text>
      <Flex direction="column" align="end">
        <FormatCryptoCurrency
          amount={profit}
          address={currency.contract}
          symbol={currency.symbol}
          textStyle="h6"
        />
        {usdPrice ? (
          <FormatCurrency
            amount={profit * (usdPrice || 0)}
            style="subtitle3"
            color="subtle"
          />
        ) : null}
      </Flex>
    </Flex>
  )
}

export default PriceBreakdown
