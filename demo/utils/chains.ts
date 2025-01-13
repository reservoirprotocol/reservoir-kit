import { customChains, reservoirChains } from '@reservoir0x/reservoir-sdk'
import { zeroAddress } from 'viem'

export default [
  {
    ...reservoirChains.mainnet,
    paymentTokens: [
      ...reservoirChains.mainnet.paymentTokens,
      {
        chainId: 8453,
        address: zeroAddress,
        symbol: 'Base ETH',
        name: 'Base ETH',
        decimals: 18,
      },
      {
        chainId: 10,
        address: zeroAddress,
        symbol: 'Optimism ETH',
        name: 'Optimism ETH',
        decimals: 18,
      },
    ],
  },
  {
    ...reservoirChains.sepolia,
    baseApiUrl: 'https://api-sepolia.reservoir.tools',
    paymentTokens: [
      ...reservoirChains.sepolia.paymentTokens,
      {
        chainId: 999999999,
        address: zeroAddress,
        symbol: 'Zora Sepolia ETH',
        name: 'Zora Sepolia ETH',
        decimals: 18,
      },
      {
        chainId: 84532,
        address: zeroAddress,
        symbol: 'Base Sepolia ETH',
        name: 'Base Sepolia ETH',
        decimals: 18,
      },
    ],
  },
  {
    ...reservoirChains.polygon,
  },
  {
    ...reservoirChains.polygonAmoy,
  },
  {
    ...reservoirChains.optimism,
    paymentTokens: [
      ...reservoirChains.optimism.paymentTokens,
      {
        chainId: 1,
        address: zeroAddress,
        symbol: 'ETH',
        name: 'ETH',
        decimals: 18,
      },
      {
        chainId: 8453,
        address: zeroAddress,
        symbol: 'Base ETH',
        name: 'Base ETH',
        decimals: 18,
      },
    ],
  },
  {
    ...reservoirChains.arbitrum,
    paymentTokens: [
      ...reservoirChains.arbitrum.paymentTokens,
      {
        chainId: 1,
        address: zeroAddress,
        symbol: 'ETH',
        name: 'ETH',
        decimals: 18,
      },
      {
        chainId: 8453,
        address: zeroAddress,
        symbol: 'Base ETH',
        name: 'Base ETH',
        decimals: 18,
      },
    ],
  },
  {
    ...reservoirChains.zora,
    paymentTokens: [
      ...reservoirChains.zora.paymentTokens,
      {
        chainId: 1,
        address: zeroAddress,
        symbol: 'ETH',
        name: 'ETH',
        decimals: 18,
      },
      {
        chainId: 8453,
        address: zeroAddress,
        symbol: 'Base ETH',
        name: 'Base ETH',
        decimals: 18,
      },
      {
        chainId: 10,
        address: zeroAddress,
        symbol: 'Optimism ETH',
        name: 'Optimism ETH',
        decimals: 18,
      },
    ],
  },
  {
    ...reservoirChains.base,
    paymentTokens: [
      ...reservoirChains.base.paymentTokens,
      {
        chainId: 1,
        address: zeroAddress,
        symbol: 'ETH',
        name: 'ETH',
        decimals: 18,
      },
      {
        chainId: 10,
        address: zeroAddress,
        symbol: 'ETH',
        name: 'Optimism ETH',
        decimals: 18,
      },
      {
        chainId: 7777777,
        address: zeroAddress,
        symbol: 'ETH',
        name: 'Zora ETH',
        decimals: 18,
      },
    ],
  },
  {
    ...reservoirChains.zkSync,
    paymentTokens: [
      {
        chainId: 324,
        address: zeroAddress,
        symbol: 'ETH',
        name: 'zkSync ETH',
        decimals: 18,
      },
      {
        chainId: 324,
        address: '0x5aea5775959fbc2557cc8789bc1bf90a239d9a91',
        symbol: 'WETH',
        name: 'WETH',
        decimals: 18,
      },
      {
        chainId: 1,
        address: zeroAddress,
        symbol: 'ETH',
        name: 'ETH',
        decimals: 18,
      },
      {
        chainId: 10,
        address: zeroAddress,
        symbol: 'ETH',
        name: 'Optimism ETH',
        decimals: 18,
      },
      {
        chainId: 8453,
        address: zeroAddress,
        symbol: 'ETH',
        name: 'Base ETH',
        decimals: 18,
      },
    ],
  },
  {
    ...reservoirChains.baseSepolia,
    paymentTokens: [
      ...reservoirChains.baseSepolia.paymentTokens,
      {
        chainId: 11155111,
        address: zeroAddress,
        symbol: 'ETH',
        name: 'Sepolia ETH',
        decimals: 18,
      },
    ],
  },
  {
    ...reservoirChains.linea,
  },
  {
    ...reservoirChains.arbitrumNova,
  },
  {
    ...reservoirChains.ancient8Testnet,
    id: customChains.ancient8Testnet.id,
  },
  {
    ...reservoirChains.scroll,
  },
  {
    ...reservoirChains.frameTestnet,
  },
  {
    ...reservoirChains.blastSepolia,
  },
  {
    ...reservoirChains.apexPop,
  },
  {
    ...reservoirChains.apexPopTestnet,
  },
  {
    ...reservoirChains.blast,
  },
  {
    ...reservoirChains.astarZkEVM,
  },
  {
    ...reservoirChains.garnet,
  },
  {
    ...reservoirChains.redstone,
  },
  {
    ...reservoirChains.berachainTestnet,
  },
  {
    ...reservoirChains.degen,
  },
  {
    ...reservoirChains.xai,
  },
  {
    ...reservoirChains.nebula,
  },
  {
    ...reservoirChains.seiTestnet,
  },
  {
    ...reservoirChains.cyber,
  },
  {
    ...reservoirChains.bitlayer,
  },
  {
    ...reservoirChains.sei,
  },
  {
    ...reservoirChains.b3Testnet,
  },
  {
    ...reservoirChains.flowPreviewnet,
  },
  {
    ...reservoirChains.cloud,
  },
  {
    ...reservoirChains.game7Testnet,
  },
  {
    ...reservoirChains.boss,
    paymentTokens: [
      ...reservoirChains.boss.paymentTokens,
      {
        chainId: 1,
        address: zeroAddress,
        symbol: 'ETH',
        name: 'ETH',
        decimals: 18,
      },
      {
        chainId: 10,
        address: zeroAddress,
        symbol: 'Optimism ETH',
        name: 'Optimism ETH',
        decimals: 18,
      },
      {
        chainId: 42161,
        address: zeroAddress,
        symbol: 'ETH',
        name: 'Arbitrum ETH',
        decimals: 18,
      },
      {
        chainId: 7777777,
        address: zeroAddress,
        symbol: 'ETH',
        name: 'Zora ETH',
        decimals: 18,
      },
      {
        chainId: 8453,
        address: zeroAddress,
        symbol: 'ETH',
        name: 'Base ETH',
        decimals: 18,
      },
      {
        chainId: 42170,
        address: zeroAddress,
        symbol: 'ETH',
        name: 'Arbitrum Nova ETH',
        decimals: 18,
      },
      {
        chainId: 70700,
        address: zeroAddress,
        symbol: 'ETH',
        name: 'Apex ETH',
        decimals: 18,
      },
      {
        chainId: 81457,
        address: zeroAddress,
        symbol: 'ETH',
        name: 'Blast ETH',
        decimals: 18,
      },
    ],
  },
  {
    ...reservoirChains.forma,
  },
  {
    ...reservoirChains.formaSketchpad,
  },
  {
    ...reservoirChains.apechain,
  },
  {
    ...reservoirChains.curtis,
  },
  {
    ...reservoirChains.shape,
  },
  {
    ...reservoirChains.shapeSepolia,
  },
  {
    ...reservoirChains.abstractTestnet,
  },
  {
    ...reservoirChains.minato,
  },
  {
    ...reservoirChains.hychain,
  },
  {
    ...reservoirChains.hychainTestnet,
  },
  {
    ...reservoirChains.flow,
  },
  {
    ...reservoirChains.zero,
  },
  {
    ...reservoirChains.zeroTestnet,
  },
  {
    ...reservoirChains.abstract,
  },
  {
    ...reservoirChains.animeTestnet,
  },
  {
    ...reservoirChains.monadDevnet,
  },
  {
    ...reservoirChains.game7,
  },
  {
    ...reservoirChains.creatorTestnet,
  },
  {
    ...reservoirChains.soneium,
  },
  {
    ...reservoirChains.storyOdyssey,
  },
]
