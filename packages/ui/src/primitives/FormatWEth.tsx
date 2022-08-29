import Box from '../primitives/Box'
import React, { FC, ComponentProps } from 'react'
import FormatCrypto from './FormatCrypto'
import WEthIcon from '../img/WEthIcon'

type FormatWEthProps = {
  logoWidth?: number
}

type Props = ComponentProps<typeof FormatCrypto> & FormatWEthProps

const FormatWEth: FC<Props> = ({
  amount,
  maximumFractionDigits,
  logoWidth = 14,
  textStyle,
  css,
  textColor,
}) => {
  return (
    <FormatCrypto
      css={css}
      textColor={textColor}
      textStyle={textStyle}
      amount={amount}
      maximumFractionDigits={maximumFractionDigits}
    >
      <Box
        css={{
          width: 'auto',
          height: logoWidth,
        }}
      >
        <WEthIcon />
      </Box>
    </FormatCrypto>
  )
}

export default FormatWEth
