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
    ...reservoirChains.goerli,
    paymentTokens: [
      ...reservoirChains.goerli.paymentTokens,
      {
        chainId: 5,
        address: '0x68B7E050E6e2C7eFE11439045c9d49813C1724B8',
        symbol: 'phUSDC',
        name: 'phUSDC',
        decimals: 6,
        coinGeckoId: 'usd-coin',
      },
      {
        chainId: 5,
        address: '0x11fE4B6AE13d2a6055C8D9cF65c55bac32B5d844',
        symbol: 'DAI',
        name: 'Dai',
        decimals: 18,
        coinGeckoId: 'dai',
      },
      {
        chainId: 11155111,
        address: zeroAddress,
        symbol: 'Sepolia ETH',
        name: 'Sepolia ETH',
        decimals: 18,
      },
    ],
  },
  {
    ...reservoirChains.sepolia,
    baseApiUrl: 'https://api-sepolia.reservoir.tools',
    paymentTokens: [...reservoirChains.sepolia.paymentTokens, {
      chainId: 5,
      address: zeroAddress,
      symbol: 'Goerli ETH',
      name: 'Goerli ETH',
      decimals: 18,
    }]
  },
  {
    ...reservoirChains.polygon,
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
  }
]
