import { BigNumberish } from 'ethers'
import { formatBN } from '../lib/numbers'
import React, { FC } from 'react'
import { Flex, Text } from './index'

type Props = {
  amount: BigNumberish | null | undefined
  maximumFractionDigits?: number
  css?: Parameters<typeof Text>['0']['css']
  textStyle?: Parameters<typeof Text>['0']['style']
  textColor?: Parameters<typeof Text>['0']['color']
  children?: React.ReactNode
}

const FormatCrypto: FC<Props> = ({
  amount,
  maximumFractionDigits = 4,
  css,
  textStyle = 'subtitle2',
  textColor = 'base',
  children,
}) => {
  const value = formatBN(amount, maximumFractionDigits)

  return (
    <Flex align="center" css={{ gap: '$1' }}>
      {value !== '-' ? children : null}
      <Text style={textStyle} color={textColor} css={css}>
        {value}
      </Text>
    </Flex>
  )
}

export default FormatCrypto
