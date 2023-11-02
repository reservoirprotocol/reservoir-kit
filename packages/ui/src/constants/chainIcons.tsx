import React from 'react'
import { reservoirChains } from '@reservoir0x/reservoir-sdk'
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
import ScrollIconDark from '../img/chains/ScrollIconDark'
import ScrollIconLight from '../img/chains/ScrollIconLight'
import PolygonZkevmIconDark from '../img/chains/PolygonZkevmIconDark'
import PolygonZkevmIconLight from '../img/chains/PolygonZkevmIconLight'
import ZksyncIconDark from '../img/chains/ZksyncIconDark'
import ZksyncIconLight from '../img/chains/ZksyncIconLight'
import ZoraIconDark from '../img/chains/ZoraIconDark'
import ZoraIconLight from '../img/chains/ZoraIconLight'

const chainIcons = {
  [reservoirChains.ancient8Testnet.id]: {
    light: <Ancient8IconDark />,
    dark: <Ancient8IconLight />,
  },
  [reservoirChains.arbitrum.id]: {
    light: <ArbitrumIconDark />,
    dark: <ArbitrumIconLight />,
  },
  [reservoirChains.arbitrumNova.id]: {
    light: <ArbitrumNovaIconDark />,
    dark: <ArbitrumNovaIconLight />,
  },
  [reservoirChains.avalanche.id]: {
    light: <AvalancheIconDark />,
    dark: <AvalancheIconLight />,
  },
  [reservoirChains.base.id]: {
    light: <BaseIconDark />,
    dark: <BaseIconLight />,
  },
  [reservoirChains.baseGoerli.id]: {
    light: <BaseIconDark />,
    dark: <BaseIconLight />,
  },
  [reservoirChains.bsc.id]: {
    light: <BscIconDark />,
    dark: <BscIconLight />,
  },
  [reservoirChains.goerli.id]: {
    light: <GoerliIconDark />,
    dark: <GoerliIconLight />,
  },
  [reservoirChains.sepolia.id]: {
    light: <GoerliIconDark />,
    dark: <GoerliIconLight />,
  },
  [reservoirChains.linea.id]: {
    light: <LineaIconDark />,
    dark: <LineaIconLight />,
  },
  [reservoirChains.mainnet.id]: {
    light: <MainnetIconDark />,
    dark: <MainnetIconLight />,
  },
  [reservoirChains.optimism.id]: {
    light: <OptimismIconDark />,
    dark: <OptimismIconLight />,
  },
  [reservoirChains.polygonZkEvm.id]: {
    light: <PolygonZkevmIconDark />,
    dark: <PolygonZkevmIconLight />,
  },
  [reservoirChains.polygon.id]: {
    light: <PolygonIconDark />,
    dark: <PolygonIconLight />,
  },
  [reservoirChains.mumbai.id]: {
    light: <PolygonIconDark />,
    dark: <PolygonIconLight />,
  },
  [reservoirChains.scrollTestnet.id]: {
    light: <ScrollIconDark />,
    dark: <ScrollIconLight />,
  },
  [reservoirChains.scroll.id]: {
    light: <ScrollIconDark />,
    dark: <ScrollIconLight />,
  },
  [reservoirChains.zkSync.id]: {
    light: <ZksyncIconDark />,
    dark: <ZksyncIconLight />,
  },
  [reservoirChains.zora.id]: {
    light: <ZoraIconDark />,
    dark: <ZoraIconLight />,
  },
}

export default chainIcons
