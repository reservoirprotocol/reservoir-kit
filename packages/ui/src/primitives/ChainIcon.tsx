import React, { FC } from 'react'
import { ThemeContext } from '../ReservoirKitProvider'
import { ReservoirKitThemeContext } from '../../stitches.config'
import { useContext } from 'react'
import { Box } from './'
import { CSS } from '@stitches/react'
import chainIcons from '../constants/chainIcons'

type Props = {
  chainId?: number
  height?: number
  css?: CSS
}

const ChainIcon: FC<Props> = ({ chainId, css = {}, height = 14 }) => {
  const themeContext = useContext(ThemeContext)
  const iconTheme: ReservoirKitThemeContext['assets']['chainIcon']['value'] =
    themeContext && (themeContext as any)
      ? themeContext['assets']['chainIcon']['value']
      : 'dark'

  const icon = chainId ? chainIcons[chainId][iconTheme] : null

  return icon ? (
    <Box css={{ display: 'flex', height: height, ...css }}>{icon}</Box>
  ) : null
}

export default ChainIcon
