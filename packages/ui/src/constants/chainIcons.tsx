import React from 'react'
import { reservoirChains } from '@reservoir0x/reservoir-sdk'
import MainnetIconDark from '../img/chains/MainnetIconDark'
import MainnetIconLight from '../img/chains/MainnetIconLight'
import PolygonIconDark from '../img/chains/PolygonIconDark'
import PolygonIconLight from '../img/chains/PolygonIconLight'
import PolygonIconColor from '../img/chains/PolygonIconColor'
import BaseIconDark from '../img/chains/BaseIconDark'
import BaseIconLight from '../img/chains/BaseIconLight'
import BaseIconColor from '../img/chains/BaseIconColor'
import Ancient8IconDark from '../img/chains/Ancient8IconDark'
import Ancient8IconLight from '../img/chains/Ancient8IconLight'
import Ancient8IconColor from '../img/chains/Ancient8IconColor'
import ArbitrumIconDark from '../img/chains/ArbitrumIconDark'
import ArbitrumIconLight from '../img/chains/ArbitrumIconLight'
import ArbitrumIconColor from '../img/chains/ArbitrumIconColor'
import ArbitrumNovaIconDark from '../img/chains/ArbitrumNovaIconDark'
import ArbitrumNovaIconLight from '../img/chains/ArbitrumNovaIconLight'
import ArbitrumNovaIconColor from '../img/chains/ArbitrumNovaIconColor'
import AvalancheIconDark from '../img/chains/AvalancheIconDark'
import AvalancheIconLight from '../img/chains/AvalancheIconLight'
import AvalancheIconColor from '../img/chains/AvalancheIconColor'
import BscIconDark from '../img/chains/BscIconDark'
import BscIconLight from '../img/chains/BscIconLight'
import BscIconColor from '../img/chains/BscIconColor'
import SepoliaIconDark from '../img/chains/SepoliaIconDark'
import SepoliaIconLight from '../img/chains/SepoliaIconLight'
import LineaIconDark from '../img/chains/LineaIconDark'
import LineaIconLight from '../img/chains/LineaIconLight'
import LineaIconColor from '../img/chains/LineaIconColor'
import OptimismIconDark from '../img/chains/OptimismIconDark'
import OptimismIconLight from '../img/chains/OptimismIconLight'
import OptimismIconColor from '../img/chains/OptimismIconColor'
import ScrollIconDark from '../img/chains/ScrollIconDark'
import ScrollIconLight from '../img/chains/ScrollIconLight'
import ScrollIconColor from '../img/chains/ScrollIconColor'
import PolygonZkevmIconDark from '../img/chains/PolygonZkevmIconDark'
import PolygonZkevmIconLight from '../img/chains/PolygonZkevmIconLight'
import PolygonZkevmIconColor from '../img/chains/PolygonZkevmIconColor'
import ZksyncIconDark from '../img/chains/ZksyncIconDark'
import ZksyncIconLight from '../img/chains/ZksyncIconLight'
import ZksyncIconColor from '../img/chains/ZksyncIconColor'
import ZoraIconDark from '../img/chains/ZoraIconDark'
import ZoraIconLight from '../img/chains/ZoraIconLight'
import ZoraIconColor from '../img/chains/ZoraIconColor'
import FrameIconDark from '../img/chains/FrameIconDark'
import FrameIconLight from '../img/chains/FrameIconLight'
import FrameIconColor from '../img/chains/FrameIconColor'
import BlastSepoliaIconColor from '../img/chains/BlastSepoliaIconColor'
import BlastSepoliaIconLight from '../img/chains/BlastSepoliaIconLight'
import BlastSepoliaIconDark from '../img/chains/BlastSepoliaIconDark'
import ApexPopIconLight from '../img/chains/ApexPopIconLight'
import ApexPopIconDark from '../img/chains/ApexPopIconDark'
import ApexPopIconColor from '../img/chains/ApexPopIconColor'
import BlastIconColor from '../img/chains/BlastIconColor'
import BlastIconDark from '../img/chains/BlastIconDark'
import BlastIconLight from '../img/chains/BlastIconLight'
import AstarZkEVMLight from '../img/chains/AstarZkEVMLight'
import AstarZkEVMDark from '../img/chains/AstarZkEVMDark'
import AstarZkEVMColor from '../img/chains/AstarZkEVMColor'
import RedstoneColor from '../img/chains/RedstoneColor'
import RedstoneDark from '../img/chains/RedstoneDark'
import RedstoneLight from '../img/chains/RedstoneLight'
import BerachainIconLight from '../img/chains/BerachainIconLight'
import BerachainIconDark from '../img/chains/BerachainIconDark'
import BerachainIconColor from '../img/chains/BerachainIconColor'

const chainIcons = {
  [reservoirChains.ancient8.id]: {
    light: <Ancient8IconDark />,
    dark: <Ancient8IconLight />,
    color: <Ancient8IconColor />,
  },
  [reservoirChains.ancient8Testnet.id]: {
    light: <Ancient8IconDark />,
    dark: <Ancient8IconLight />,
    color: <Ancient8IconColor />,
  },
  [reservoirChains.arbitrum.id]: {
    light: <ArbitrumIconDark />,
    dark: <ArbitrumIconLight />,
    color: <ArbitrumIconColor />,
  },
  [reservoirChains.arbitrumNova.id]: {
    light: <ArbitrumNovaIconDark />,
    dark: <ArbitrumNovaIconLight />,
    color: <ArbitrumNovaIconColor />,
  },
  [reservoirChains.avalanche.id]: {
    light: <AvalancheIconDark />,
    dark: <AvalancheIconLight />,
    color: <AvalancheIconColor />,
  },
  [reservoirChains.base.id]: {
    light: <BaseIconDark />,
    dark: <BaseIconLight />,
    color: <BaseIconColor />,
  },
  [reservoirChains.baseSepolia.id]: {
    light: <BaseIconDark />,
    dark: <BaseIconLight />,
    color: <BaseIconColor />,
  },
  [reservoirChains.bsc.id]: {
    light: <BscIconDark />,
    dark: <BscIconLight />,
    color: <BscIconColor />,
  },
  [reservoirChains.opBnb.id]: {
    light: <BscIconDark />,
    dark: <BscIconLight />,
    color: <BscIconColor />,
  },
  [reservoirChains.sepolia.id]: {
    light: <SepoliaIconDark />,
    dark: <SepoliaIconLight />,
    color: null,
  },
  [reservoirChains.linea.id]: {
    light: <LineaIconDark />,
    dark: <LineaIconLight />,
    color: <LineaIconColor />,
  },
  [reservoirChains.mainnet.id]: {
    light: <MainnetIconDark />,
    dark: <MainnetIconLight />,
    color: null,
  },
  [reservoirChains.optimism.id]: {
    light: <OptimismIconDark />,
    dark: <OptimismIconLight />,
    color: <OptimismIconColor />,
  },
  [reservoirChains.polygonZkEvm.id]: {
    light: <PolygonZkevmIconDark />,
    dark: <PolygonZkevmIconLight />,
    color: <PolygonZkevmIconColor />,
  },
  [reservoirChains.polygon.id]: {
    light: <PolygonIconDark />,
    dark: <PolygonIconLight />,
    color: <PolygonIconColor />,
  },

  [reservoirChains.polygonAmoy.id]: {
    light: <PolygonIconDark />,
    dark: <PolygonIconLight />,
    color: <PolygonIconColor />,
  },
  [reservoirChains.scrollTestnet.id]: {
    light: <ScrollIconDark />,
    dark: <ScrollIconLight />,
    color: <ScrollIconColor />,
  },
  [reservoirChains.scroll.id]: {
    light: <ScrollIconDark />,
    dark: <ScrollIconLight />,
    color: <ScrollIconColor />,
  },
  [reservoirChains.zkSync.id]: {
    light: <ZksyncIconDark />,
    dark: <ZksyncIconLight />,
    color: <ZksyncIconColor />,
  },
  [reservoirChains.zora.id]: {
    light: <ZoraIconDark />,
    dark: <ZoraIconLight />,
    color: <ZoraIconColor />,
  },
  [reservoirChains.frameTestnet.id]: {
    light: <FrameIconDark />,
    dark: <FrameIconLight />,
    color: <FrameIconColor />,
  },
  [reservoirChains.blastSepolia.id]: {
    light: <BlastSepoliaIconDark />,
    dark: <BlastSepoliaIconLight />,
    color: <BlastSepoliaIconColor />,
  },
  [reservoirChains.apexPop.id]: {
    light: <ApexPopIconLight />,
    dark: <ApexPopIconDark />,
    color: <ApexPopIconColor />,
  },
  [reservoirChains.apexPopTestnet.id]: {
    light: <ApexPopIconLight />,
    dark: <ApexPopIconDark />,
    color: <ApexPopIconColor />,
  },
  [reservoirChains.blast.id]: {
    light: <BlastIconLight />,
    dark: <BlastIconDark />,
    color: <BlastIconColor />,
  },
  [reservoirChains.astarZkEVM.id]: {
    light: <AstarZkEVMLight />,
    dark: <AstarZkEVMDark />,
    color: <AstarZkEVMColor />,
  },
  [reservoirChains.garnet.id]: {
    light: <RedstoneLight />,
    dark: <RedstoneDark />,
    color: <RedstoneColor />,
  },
  [reservoirChains.redstone.id]: {
    light: <RedstoneLight />,
    dark: <RedstoneDark />,
    color: <RedstoneColor />,
  },
  [reservoirChains.berachainTestnet.id]: {
    light: <BerachainIconLight />,
    dark: <BerachainIconDark />,
    color: <BerachainIconColor />,
  },
}

export default chainIcons
