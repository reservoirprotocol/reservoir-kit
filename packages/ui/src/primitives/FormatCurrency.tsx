import { BigNumberish } from 'ethers'
import { formatBN } from '../lib/numbers'
import React, { FC } from 'react'
import { Flex } from './Flex'
import { Text } from './Text'

type Props = {
  amount: BigNumberish | null | undefined
  maximumFractionDigits?: number
  css?: Parameters<typeof Text>['0']['css']
  textStyle?: Parameters<typeof Text>['0']['style']
  children?: React.ReactNode
}

const FormatCurrency: FC<Props> = ({
  amount,
  maximumFractionDigits = 4,
  css,
  textStyle = 'subtitle2',
  children,
}) => {
  const value = formatBN(amount, maximumFractionDigits)

  return (
    <Flex align="center" css={{ gap: '$1' }}>
      {value !== '-' ? children : null}
      <Text style={textStyle} css={css}>
        {value}
      </Text>
    </Flex>
  )
}

export default FormatCurrency
