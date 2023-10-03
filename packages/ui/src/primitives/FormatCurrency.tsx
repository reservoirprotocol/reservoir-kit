import React, { ComponentPropsWithoutRef, FC, useEffect, useState } from 'react'
import { Text } from './index'
import { formatUnits } from 'viem'

type Props = {
  amount: string | number | bigint | null | undefined
  currency?: Intl.NumberFormatOptions['currency']
  maximumFractionDigits?: number
}

const FormatCurrency: FC<ComponentPropsWithoutRef<typeof Text> & Props> = ({
  amount,
  maximumFractionDigits = 2,
  currency = 'USD',
  ...props
}) => {
  const [formattedValue, setFormattedValue] = useState('')

  useEffect(() => {
    let parsedAmount
    if (typeof amount === 'bigint') {
      parsedAmount = formatUnits(amount, 6)
    } else {
      parsedAmount = amount
    }
    if (parsedAmount) {
      const lowestValue = Number(
        `0.${new Array(maximumFractionDigits).join('0')}1`
      )
      const tooLow = +parsedAmount < lowestValue

      const formatted = new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: currency,
      }).format(tooLow ? lowestValue : +parsedAmount)
      setFormattedValue(tooLow ? `< ${formatted}` : formatted)
    } else {
      setFormattedValue('')
    }
  }, [amount, maximumFractionDigits])

  return (
    <Text
      {...props}
      style={props.style || 'subtitle3'}
      color={props.color || 'base'}
    >
      {formattedValue}
    </Text>
  )
}

export default FormatCurrency
