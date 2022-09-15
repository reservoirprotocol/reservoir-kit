import FormatCrypto from './FormatCrypto'
import React, { FC, ComponentProps, useContext } from 'react'
import { ThemeContext } from '../ReservoirKitProvider'
import { ReservoirKitThemeContext } from '../../stitches.config'
import EthIconGlyph from '../img/EthIconGlyph'
import EthIconGray from '../img/EthIconGray'
import EthIconPurple from '../img/EthIconPurple'
import Flex from '../primitives/Flex'

type FormatEthProps = {
  logoWidth?: number
}

type Props = ComponentProps<typeof FormatCrypto> & FormatEthProps

export const EthLogo = () => {
  const themeContext = useContext(ThemeContext)
  const ethIcon: ReservoirKitThemeContext['assets']['ethIcon']['value'] =
    themeContext && (themeContext as any)
      ? themeContext['assets']['ethIcon']['value']
      : 'glyph'

  switch (ethIcon) {
    case 'glyph':
      return <EthIconGlyph />
    case 'gray':
      return <EthIconGray />
    case 'purple':
      return <EthIconPurple />
  }
}

const FormatEth: FC<Props> = ({
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
      <Flex
        css={{
          width: 'auto',
          height: logoWidth,
        }}
      >
        <EthLogo />
      </Flex>
    </FormatCrypto>
  )
}

export default FormatEth
