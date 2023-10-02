import { Chain } from "viem";

export const arbitrumNova = {
  id: 42170,
  name: 'Arbitrum Nova',
  network: 'arbitrum-nova',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    blast: {
      http: ['https://arbitrum-nova.public.blastapi.io'],
      webSocket: ['wss://arbitrum-nova.public.blastapi.io'],
    },
    default: {
      http: ['https://nova.arbitrum.io/rpc'],
    },
    public: {
      http: ['https://nova.arbitrum.io/rpc'],
    },
  },
  blockExplorers: {
    etherscan: { name: 'Arbiscan', url: 'https://nova.arbiscan.io' },
    blockScout: {
      name: 'BlockScout',
      url: 'https://nova-explorer.arbitrum.io/',
    },
    default: { name: 'Arbiscan', url: 'https://nova.arbiscan.io' },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 1746963,
    },
  },
} as const satisfies Chain

export const ancient8Testnet = {
  id: 2863311531,
  name: 'Ancient8 Testnet',
  network: 'ancient8',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc-testnet.ancient8.gg'],
      webSocket: ['https://rpc-testnet.ancient8.gg'],
    },
    public: {
      http: ['https://rpc-testnet.ancient8.gg'],
      webSocket: ['https://rpc-testnet.ancient8.gg'],
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'a8scan',
      url: 'https://testnet.a8scan.io',
    },
    default: {
      name: 'a8scan',
      url: 'https://testnet.a8scan.io',
    },
  },
} as const satisfies Chain

export const customChains = {
  arbitrumNova,
  ancient8Testnet
} as const satisfies Record<string, Chain>