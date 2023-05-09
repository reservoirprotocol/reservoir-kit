import React, { FC } from 'react'
import { useChainCurrency } from '../../hooks'
import { Flex, FormatCryptoCurrency, Img, Text } from '../../primitives'
import Tooltip from '../../primitives/Tooltip'

type Props = {
  name?: string
  image?: string
  amount?: number
  currency: ReturnType<typeof useChainCurrency>
}

export const SweepItem: FC<Props> = ({ name, image, amount, currency }) => {
  return (
    <Tooltip
      content={
        <Text style="body3" as="p">
          {name}
        </Text>
      }
      side="top"
      sideOffset={-6}
    >
      <Flex
        direction="column"
        css={{
          width: 60,
          borderRadius: 8,
          backgroundColor: '$neutralBg',
          overflow: 'hidden',
        }}
      >
        <Img src={image as string} css={{ width: 60, height: 60 }} width={20} />
        <Flex css={{ px: '$1', py: '$2' }}>
          <FormatCryptoCurrency
            amount={amount}
            address={currency.address}
            decimals={currency.decimals}
            symbol={currency.symbol}
            maximumFractionDigits={amount && amount >= 10 ? 2 : 3}
            css={{ whiteSpace: 'nowrap' }}
          />
        </Flex>
      </Flex>
    </Tooltip>
  )
}
