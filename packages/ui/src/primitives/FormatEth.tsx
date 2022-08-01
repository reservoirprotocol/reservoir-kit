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

type EthLogoProps = {
  width: number
}

export const EthLogo = ({ width }: EthLogoProps) => {
  const themeContext = useContext(ThemeContext)
  const ethIcon: ReservoirKitThemeContext['assets']['ethIcon']['value'] =
    themeContext && (themeContext as any)
      ? themeContext['assets']['ethIcon']['value']
      : 'glyph'

  switch (ethIcon) {
    case 'glyph':
      return <EthIconGlyph width={width} />
    case 'gray':
      return <EthIconGray width={width} />
    case 'purple':
      return <EthIconPurple width={width} />
  }
}

const FormatEth: FC<Props> = ({
  amount,
  maximumFractionDigits,
  logoWidth = 12,
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
      <EthLogo width={logoWidth} />
    </FormatCrypto>
  )
}

export default FormatEth
