import FormatCrypto from './FormatCrypto'
import FormatEth from './FormatEth'
import React, { FC, ComponentProps } from 'react'
import { useReservoirClient } from '../hooks/index'
import { constants } from 'ethers'

type FormatCryptoCurrencyProps = {
  logoWidth?: number
  address?: string
}

type Props = ComponentProps<typeof FormatCrypto> & FormatCryptoCurrencyProps

const FormatCryptoCurrency: FC<Props> = ({
  amount,
  address = constants.AddressZero,
  maximumFractionDigits,
  logoWidth = 14,
  textStyle,
  css,
  textColor,
  decimals,
}) => {
  const client = useReservoirClient()

  if (constants.AddressZero === address) {
    return (
      <FormatEth
        css={css}
        textColor={textColor}
        textStyle={textStyle}
        amount={amount}
        maximumFractionDigits={maximumFractionDigits}
      />
    )
  }

  const logoUrl = `${client?.apiBase}/redirect/currency/${address}/icon/v1`

  return (
    <FormatCrypto
      css={css}
      textColor={textColor}
      textStyle={textStyle}
      amount={amount}
      maximumFractionDigits={maximumFractionDigits}
      decimals={decimals}
    >
      <img style={{ width: logoWidth }} src={logoUrl} />
    </FormatCrypto>
  )
}

export default FormatCryptoCurrency
