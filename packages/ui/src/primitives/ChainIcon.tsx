import React, { FC } from 'react'
import { reservoirChains } from '@reservoir0x/reservoir-sdk'
import { ThemeContext } from '../ReservoirKitProvider'
import { ReservoirKitThemeContext } from '../../stitches.config'
import { useContext } from 'react'
import MainnetIconDark from '../img/chains/MainnetIconDark'
import MainnetIconLight from '../img/chains/MainnetIconLight'
import PolygonIconDark from '../img/chains/PolygonIconDark'
import PolygonIconLight from '../img/chains/PolygonIconLight'
import BaseIconDark from '../img/chains/BaseIconDark'
import BaseIconLight from '../img/chains/BaseIconLight'
import Ancient8IconDark from '../img/chains/Ancient8IconDark'
import Ancient8IconLight from '../img/chains/Ancient8IconLight'
import ArbitrumIconDark from '../img/chains/ArbitrumIconDark'
import ArbitrumIconLight from '../img/chains/ArbitrumIconLight'
import ArbitrumNovaIconDark from '../img/chains/ArbitrumNovaIconDark'
import ArbitrumNovaIconLight from '../img/chains/ArbitrumNovaIconLight'
import AvalancheIconDark from '../img/chains/AvalancheIconDark'
import AvalancheIconLight from '../img/chains/AvalancheIconLight'
import BscIconDark from '../img/chains/BscIconDark'
import BscIconLight from '../img/chains/BscIconLight'
import GoerliIconDark from '../img/chains/GoerliIconDark'
import GoerliIconLight from '../img/chains/GoerliIconLight'
import LineaIconDark from '../img/chains/LineaIconDark'
import LineaIconLight from '../img/chains/LineaIconLight'
import OptimismIconDark from '../img/chains/OptimismIconDark'
import OptimismIconLight from '../img/chains/OptimismIconLight'
import ScrollTestnetIconDark from '../img/chains/ScrollTestnetIconDark'
import ScrollTestnetIconLight from '../img/chains/ScrollTestnetIconLight'
import PolygonZkevmIconDark from '../img/chains/PolygonZkevmIconDark'
import PolygonZkevmIconLight from '../img/chains/PolygonZkevmIconLight'
import ZksyncIconDark from '../img/chains/ZksyncIconDark'
import ZksyncIconLight from '../img/chains/ZksyncIconLight'
import ZoraIconDark from '../img/chains/ZoraIconDark'
import ZoraIconLight from '../img/chains/ZoraIconLight'
import { Box } from './'

type Props = {
  chainId?: number
  height?: number
}

const ChainIcon: FC<Props> = ({ chainId, height = 14 }) => {
  const themeContext = useContext(ThemeContext)
  const chainIcon: ReservoirKitThemeContext['assets']['chainIcon']['value'] =
    themeContext && (themeContext as any)
      ? themeContext['assets']['chainIcon']['value']
      : 'dark'
  let icon = null
  switch (chainId) {
    case reservoirChains.ancient8Testnet.id: {
      icon =
        chainIcon === 'light' ? <Ancient8IconDark /> : <Ancient8IconLight />
      break
    }
    case reservoirChains.arbitrum.id: {
      icon =
        chainIcon === 'light' ? <ArbitrumIconDark /> : <ArbitrumIconLight />
      break
    }
    case reservoirChains.arbitrumNova.id: {
      icon =
        chainIcon === 'light' ? (
          <ArbitrumNovaIconDark />
        ) : (
          <ArbitrumNovaIconLight />
        )
      break
    }
    case reservoirChains.avalanche.id: {
      icon =
        chainIcon === 'light' ? <AvalancheIconDark /> : <AvalancheIconLight />
      break
    }
    case reservoirChains.base.id:
    case reservoirChains.baseGoerli.id: {
      icon = chainIcon === 'light' ? <BaseIconDark /> : <BaseIconLight />
      break
    }
    case reservoirChains.bsc.id: {
      icon = chainIcon === 'light' ? <BscIconDark /> : <BscIconLight />
      break
    }
    case reservoirChains.goerli.id:
    case reservoirChains.sepolia.id: {
      icon = chainIcon === 'light' ? <GoerliIconDark /> : <GoerliIconLight />
      break
    }
    case reservoirChains.linea.id: {
      icon = chainIcon === 'light' ? <LineaIconDark /> : <LineaIconLight />
      break
    }
    case reservoirChains.mainnet.id: {
      icon = chainIcon === 'light' ? <MainnetIconDark /> : <MainnetIconLight />
      break
    }
    case reservoirChains.optimism.id: {
      icon =
        chainIcon === 'light' ? <OptimismIconDark /> : <OptimismIconLight />
      break
    }
    case reservoirChains.polygonZkEvm.id: {
      icon =
        chainIcon === 'light' ? (
          <PolygonZkevmIconDark />
        ) : (
          <PolygonZkevmIconLight />
        )
      break
    }
    case reservoirChains.polygon.id:
    case reservoirChains.mumbai.id: {
      icon = chainIcon === 'light' ? <PolygonIconDark /> : <PolygonIconLight />
      break
    }
    case reservoirChains.scrollTestnet.id: {
      icon =
        chainIcon === 'light' ? (
          <ScrollTestnetIconDark />
        ) : (
          <ScrollTestnetIconLight />
        )
      break
    }
    case reservoirChains.zkSync.id: {
      icon = chainIcon === 'light' ? <ZksyncIconDark /> : <ZksyncIconLight />
      break
    }
    case reservoirChains.zora.id:
    case reservoirChains.zoraTestnet.id: {
      icon = chainIcon === 'light' ? <ZoraIconDark /> : <ZoraIconLight />
      break
    }
  }
  return icon ? (
    <Box css={{ display: 'flex', height: height }}>{icon}</Box>
  ) : null
}

export default ChainIcon
