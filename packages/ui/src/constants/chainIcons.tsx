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
import DegenIconLight from '../img/chains/DegenIconLight'
import DegenIconDark from '../img/chains/DegenIconDark'
import DegenIconColor from '../img/chains/DegenIconColor'
import XaiIconLight from '../img/chains/XaiIconLight'
import XaiIconDark from '../img/chains/XaiIconDark'
import XaiIconColor from '../img/chains/XaiIconColor'
import NebulaIconLight from '../img/chains/NebulaIconLight'
import NebulaIconDark from '../img/chains/NebulaIconDark'
import NebulaIconColor from '../img/chains/NebulaIconColor'
import SeiTestnetIconLight from '../img/chains/SeiTestnetIconLight'
import SeiTestnetIconDark from '../img/chains/SeiTestnetIconDark'
import SeiTestnetIconColor from '../img/chains/SeiTestnetIconColor'
import CyberIconLight from '../img/chains/CyberIconLight'
import CyberIconDark from '../img/chains/CyberIconDark'
import CyberIconColor from '../img/chains/CyberIconColor'
import BitlayerIconLight from '../img/chains/BitlayerIconLight'
import BitlayerIconDark from '../img/chains/BitlayerIconDark'
import BitlayerIconColor from '../img/chains/BitlayerIconColor'
import SeiIconLight from '../img/chains/SeiIconLight'
import SeiIconDark from '../img/chains/SeiIconDark'
import SeiIconColor from '../img/chains/SeiIconColor'
import B3IconLight from '../img/chains/B3IconLight'
import B3IconDark from '../img/chains/B3IconDark'
import B3IconColor from '../img/chains/B3IconColor'
import FlowPreviewnetIconLight from '../img/chains/FlowPreviewnetIconLight'
import FlowPreviewnetIconDark from '../img/chains/FlowPreviewnetIconDark'
import FlowPreviewnetIconColor from '../img/chains/FlowPreviewnetIconColor'
import CloudIconLight from '../img/chains/CloudIconLight'
import CloudIconDark from '../img/chains/CloudIconDark'
import CloudIconColor from '../img/chains/CloudIconColor'
import Game7IconLight from '../img/chains/Game7IconLight'
import Game7IconDark from '../img/chains/Game7IconDark'
import Game7IconColor from '../img/chains/Game7IconColor'
import FormaIconLight from '../img/chains/FormaIconLight'
import FormaIconDark from '../img/chains/FormaIconDark'
import FormaIconColor from '../img/chains/FormaIconColor'
import ApechainIconLight from '../img/chains/ApechainIconLight'
import ApechainIconDark from '../img/chains/ApechainIconDark'
import ApechainIconColor from '../img/chains/ApechainIconColor'
import ShapeIconLight from '../img/chains/ShapeIconLight'
import ShapeIconDark from '../img/chains/ShapeIconDark'
import ShapeIconColor from '../img/chains/ShapeIconColor'
import AbstractIconLight from '../img/chains/AbstractIconLight'
import AbstractIconDark from '../img/chains/AbstractIconDark'
import AbstractIconColor from '../img/chains/AbstractIconColor'
import HychainIconLight from '../img/chains/HychainIconLight'
import HychainIconDark from '../img/chains/HychainIconDark'
import HychainIconColor from '../img/chains/HychainIconColor'
import ZeroIconLight from '../img/chains/ZeroIconLight'
import ZeroIconDark from '../img/chains/ZeroIconDark'
import ZeroIconColor from '../img/chains/ZeroIconColor'
import AnimeIconLight from '../img/chains/AnimeIconLight'
import AnimeIconDark from '../img/chains/AnimeIconDark'
import AnimeIconColor from '../img/chains/AnimeIconColor'
import MonadIconLight from '../img/chains/MonadIconLight'
import MonadIconDark from '../img/chains/MonadIconDark'
import MonadIconColor from '../img/chains/MonadIconColor'
import CreatorTestnetIconLight from '../img/chains/CreatorTestnetIconLight'
import CreatorTestnetIconDark from '../img/chains/CreatorTestnetIconDark'
import CreatorTestnetIconColor from '../img/chains/CreatorTestnetIconColor'
import SoneiumIconLight from '../img/chains/SoneiumIconLight'
import SoneiumIconDark from '../img/chains/SoneiumIconDark'
import SoneiumIconColor from '../img/chains/SoneiumIconColor'

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
  [reservoirChains.degen.id]: {
    light: <DegenIconLight />,
    dark: <DegenIconDark />,
    color: <DegenIconColor />,
  },
  [reservoirChains.xai.id]: {
    light: <XaiIconLight />,
    dark: <XaiIconDark />,
    color: <XaiIconColor />,
  },
  [reservoirChains.nebula.id]: {
    light: <NebulaIconLight />,
    dark: <NebulaIconDark />,
    color: <NebulaIconColor />,
  },
  [reservoirChains.seiTestnet.id]: {
    light: <SeiTestnetIconLight />,
    dark: <SeiTestnetIconDark />,
    color: <SeiTestnetIconColor />,
  },
  [reservoirChains.cyber.id]: {
    light: <CyberIconLight />,
    dark: <CyberIconDark />,
    color: <CyberIconColor />,
  },
  [reservoirChains.bitlayer.id]: {
    light: <BitlayerIconLight />,
    dark: <BitlayerIconDark />,
    color: <BitlayerIconColor />,
  },
  [reservoirChains.sei.id]: {
    light: <SeiIconLight />,
    dark: <SeiIconDark />,
    color: <SeiIconColor />,
  },
  [reservoirChains.b3Testnet.id]: {
    light: <B3IconLight />,
    dark: <B3IconDark />,
    color: <B3IconColor />,
  },
  [reservoirChains.flowPreviewnet.id]: {
    light: <FlowPreviewnetIconLight />,
    dark: <FlowPreviewnetIconDark />,
    color: <FlowPreviewnetIconColor />,
  },
  [reservoirChains.cloud.id]: {
    light: <CloudIconLight />,
    dark: <CloudIconDark />,
    color: <CloudIconColor />,
  },
  [reservoirChains.game7Testnet.id]: {
    light: <Game7IconLight />,
    dark: <Game7IconDark />,
    color: <Game7IconColor />,
  },
  [reservoirChains.boss.id]: {
    light: <ApexPopIconLight />,
    dark: <ApexPopIconDark />,
    color: <ApexPopIconColor />,
  },
  [reservoirChains.forma.id]: {
    light: <FormaIconLight />,
    dark: <FormaIconDark />,
    color: <FormaIconColor />,
  },
  [reservoirChains.forma.id]: {
    light: <FormaIconLight />,
    dark: <FormaIconDark />,
    color: <FormaIconColor />,
  },
  [reservoirChains.formaSketchpad.id]: {
    light: <FormaIconLight />,
    dark: <FormaIconDark />,
    color: <FormaIconColor />,
  },
  [reservoirChains.b3.id]: {
    light: <B3IconLight />,
    dark: <B3IconDark />,
    color: <B3IconColor />,
  },
  [reservoirChains.apechain.id]: {
    light: <ApechainIconLight />,
    dark: <ApechainIconDark />,
    color: <ApechainIconColor />,
  },
  [reservoirChains.curtis.id]: {
    light: <ApechainIconLight />,
    dark: <ApechainIconDark />,
    color: <ApechainIconColor />,
  },
  [reservoirChains.shape.id]: {
    light: <ShapeIconLight />,
    dark: <ShapeIconDark />,
    color: <ShapeIconColor />,
  },
  [reservoirChains.shapeSepolia.id]: {
    light: <ShapeIconLight />,
    dark: <ShapeIconDark />,
    color: <ShapeIconColor />,
  },
  [reservoirChains.abstractTestnet.id]: {
    light: <AbstractIconLight />,
    dark: <AbstractIconDark />,
    color: <AbstractIconColor />,
  },
  [reservoirChains.minato.id]: {
    light: <SoneiumIconLight />,
    dark: <SoneiumIconDark />,
    color: <SoneiumIconColor />,
  },
  [reservoirChains.hychain.id]: {
    light: <HychainIconLight />,
    dark: <HychainIconDark />,
    color: <HychainIconColor />,
  },
  [reservoirChains.hychainTestnet.id]: {
    light: <HychainIconLight />,
    dark: <HychainIconDark />,
    color: <HychainIconColor />,
  },
  [reservoirChains.flow.id]: {
    light: <FlowPreviewnetIconLight />,
    dark: <FlowPreviewnetIconDark />,
    color: <FlowPreviewnetIconColor />,
  },
  [reservoirChains.zero.id]: {
    light: <ZeroIconLight />,
    dark: <ZeroIconDark />,
    color: <ZeroIconColor />,
  },
  [reservoirChains.zeroTestnet.id]: {
    light: <ZeroIconLight />,
    dark: <ZeroIconDark />,
    color: <ZeroIconColor />,
  },
  [reservoirChains.abstract.id]: {
    light: <AbstractIconLight />,
    dark: <AbstractIconDark />,
    color: <AbstractIconColor />,
  },
  [reservoirChains.animeTestnet.id]: {
    light: <AnimeIconLight />,
    dark: <AnimeIconDark />,
    color: <AnimeIconColor />,
  },
  [reservoirChains.monadDevnet.id]: {
    light: <MonadIconLight />,
    dark: <MonadIconDark />,
    color: <MonadIconColor />,
  },
  [reservoirChains.game7.id]: {
    light: <Game7IconLight />,
    dark: <Game7IconDark />,
    color: <Game7IconColor />,
  },
  [reservoirChains.creatorTestnet.id]: {
    light: <CreatorTestnetIconLight />,
    dark: <CreatorTestnetIconDark />,
    color: <CreatorTestnetIconColor />,
  },
  [reservoirChains.soneium.id]: {
    light: <SoneiumIconLight />,
    dark: <SoneiumIconDark />,
    color: <SoneiumIconColor />,
  },
}

export default chainIcons
