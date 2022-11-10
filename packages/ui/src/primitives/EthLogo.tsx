import React, { useContext } from 'react'
import { ThemeContext } from '../ReservoirKitProvider'
import { ReservoirKitThemeContext } from '../../stitches.config'
import EthIconGlyph from '../img/EthIconGlyph'
import EthIconGray from '../img/EthIconGray'
import EthIconPurple from '../img/EthIconPurple'

const EthLogo = () => {
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

export default EthLogo
