import React, { FC } from 'react'
import { useChainCurrency } from '../../hooks'
import { Flex, FormatCryptoCurrency } from '../../primitives'

type Props = {
  name?: string
  image?: string
  amount?: number
  currency: ReturnType<typeof useChainCurrency>
}

export const SweepItem: FC<Props> = ({ name, image, amount, currency }) => {
  return (
    <Flex
      direction="column"
      css={{
        width: 60,
        borderRadius: 8,
        backgroundColor: '$neutralBg',
        overflow: 'hidden',
      }}
    >
      <img
        src={image}
        style={{
          width: 60,
          height: 60,
          backgroundColor: '$neutralBg',
          objectFit: 'cover',
        }}
      />
      <Flex css={{ px: '$3', py: '$2' }}>
        <FormatCryptoCurrency
          amount={amount}
          address={currency.address}
          decimals={currency.decimals}
        />
      </Flex>
    </Flex>
  )
}
