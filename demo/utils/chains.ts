import { customChains, reservoirChains } from '@reservoir0x/reservoir-sdk'
import { zeroAddress } from 'viem'

export default [
  {
    ...reservoirChains.mainnet,
    paymentTokens: [...reservoirChains.mainnet.paymentTokens, {
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
    }]
  },
  {
    ...reservoirChains.sepolia,
    baseApiUrl: 'https://api-sepolia.reservoir.tools',
    paymentTokens: [...reservoirChains.sepolia.paymentTokens]
  },
  {
    ...reservoirChains.polygon,
  },
  {
    ...reservoirChains.polygonAmoy
  },
  {
    ...reservoirChains.optimism,
    paymentTokens: [...reservoirChains.optimism.paymentTokens, {
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
    }]
  },
  {
    ...reservoirChains.arbitrum,
    paymentTokens: [...reservoirChains.arbitrum.paymentTokens, {
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
    }]
  },
  {
    ...reservoirChains.zora,
    paymentTokens: [...reservoirChains.zora.paymentTokens, {
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
    },{
      chainId: 10,
      address: zeroAddress,
      symbol: 'Optimism ETH',
      name: 'Optimism ETH',
      decimals: 18,
    }]
  },
  {
    ...reservoirChains.base,
    paymentTokens: [...reservoirChains.base.paymentTokens, {
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
    }]
  },
  {
    ...reservoirChains.baseSepolia,
    paymentTokens: [
      ...reservoirChains.base.paymentTokens,
      {
        chainId: 11155111,
        address: zeroAddress,
        symbol: 'ETH',
        name: 'Sepolia ETH',
        decimals: 18,
      },
    ]
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
    ...reservoirChains.frameTestnet
  },
  {
    ...reservoirChains.blastSepolia
  },
  {
    ...reservoirChains.apexPop
  },
  {
    ...reservoirChains.apexPopTestnet
  },
  {
    ...reservoirChains.blast
  },
  {
    ...reservoirChains.astarZkEVM,
  },
  {
    ...reservoirChains.garnet,
  },
  {
    ...reservoirChains.redstone
  },
  {
    ...reservoirChains.berachainTestnet
  },
  {
    ...reservoirChains.degen
  },
  {
    ...reservoirChains.xai
  },
  {
    ...reservoirChains.nebula
  },
  {
    ...reservoirChains.seiTestnet
  },
  {
    ...reservoirChains.cyber
  },
  {
    ...reservoirChains.bitlayer
  },
  {
    ...reservoirChains.sei
  },
  {
    ...reservoirChains.b3Testnet
  },
  {
    ...reservoirChains.flowPreviewnet
  },
  {
    ...reservoirChains.cloud
  },
  {
    ...reservoirChains.game7Testnet
  }
]
