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
  color?: boolean
}

const ChainIcon: FC<Props> = ({ chainId, css = {}, height = 14, color }) => {
  const themeContext = useContext(ThemeContext)

  if (!chainId) {
    return null
  }

  const chainIconConfig = chainIcons[chainId]
  let iconTheme: ReservoirKitThemeContext['assets']['chainIcon']['value'] =
    themeContext && (themeContext as any)
      ? themeContext['assets']['chainIcon']['value']
      : 'dark'

  let icon: JSX.Element | null = chainIconConfig[iconTheme]

  if (color) {
    icon = chainIconConfig.color
  }

  return icon ? (
    <Box
      css={{
        display: 'flex',
        height: height,
        ...css,
      }}
    >
      {icon}
    </Box>
  ) : null
}

export default ChainIcon
