import FormatCrypto from './FormatCrypto'
import React, { FC, ComponentProps, useContext } from 'react'
import { ThemeContext } from '../ReservoirKitProvider'
import { ReservoirKitThemeContext } from '../../stitches.config'
import EthIconGlyph from '../img/EthIconGlyph'
import EthIconGray from '../img/EthIconGray'
import EthIconPurple from '../img/EthIconPurple'

type FormatEthProps = {
  logoWidth?: number
}

type Props = ComponentProps<typeof FormatCrypto> & FormatEthProps

const FormatEth: FC<Props> = ({
  amount,
  maximumFractionDigits,
  logoWidth = 12,
  css,
  textColor,
}) => {
  const themeContext = useContext(ThemeContext)
  const ethIcon: ReservoirKitThemeContext['assets']['ethIcon']['value'] =
    themeContext && (themeContext as any)
      ? themeContext['assets']['ethIcon']['value']
      : 'glyph'
  let icon = null

  switch (ethIcon) {
    case 'glyph':
      icon = <EthIconGlyph width={logoWidth} />
      break
    case 'gray':
      icon = <EthIconGray width={logoWidth} />
      break
    case 'purple':
      icon = <EthIconPurple width={logoWidth} />
      break
  }

  return (
    <FormatCrypto
      css={css}
      textColor={textColor}
      amount={amount}
      maximumFractionDigits={maximumFractionDigits}
    >
      {icon}
    </FormatCrypto>
  )
}

export default FormatEth
