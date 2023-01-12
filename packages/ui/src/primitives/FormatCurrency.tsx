import React, { ComponentPropsWithoutRef, FC, useEffect, useState } from 'react'
import { Text } from './index'

type Props = {
  amount: string | number | null | undefined
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
    if (amount) {
      const lowestValue = Number(
        `0.${new Array(maximumFractionDigits).join('0')}1`
      )
      const tooLow = +amount < lowestValue

      const formatted = new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: currency,
      }).format(tooLow ? lowestValue : +amount)
      setFormattedValue(tooLow ? `< ${formatted}` : formatted)
    } else {
      setFormattedValue('')
    }
  }, [amount, maximumFractionDigits])

  return (
    <Text
      {...props}
      style={props.style || 'subtitle2'}
      color={props.color || 'base'}
    >
      {formattedValue}
    </Text>
  )
}

export default FormatCurrency
