import { Chain } from "viem";

export const zora = {
  id: 7777777,
  name: 'Zora',
  network: 'zora',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.zora.co'],
    },
    public: {
      http: ['https://rpc.zora.co'],
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'Zora explorer',
      url: 'https://explorer.zora.co',
    },
    default: {
      name: 'Zora explorer',
      url: 'https://explorer.zora.co',
    },
  },
} as const satisfies Chain

export const zoraTestnet = {
  id: 999,
  name: 'Zora Testnet',
  network: 'zora-testnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://testnet.rpc.zora.co'],
    },
    public: {
      http: ['https://testnet.rpc.zora.co'],
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'Zora Testnet explorer',
      url: 'https://testnet.explorer.zora.co',
    },
    default: {
      name: 'Zora Testnet explorer',
      url: 'https://testnet.explorer.zora.co',
    },
  },
} as const satisfies Chain


export const base = {
  id: 8453,
  name: 'Base',
  network: 'base',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://developer-access-mainnet.base.org'],
    },
    public: {
      http: ['https://developer-access-mainnet.base.org'],
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'Basescan',
      url: 'https://basescan.org',
    },
    default: {
      name: 'BaseScan',
      url: 'https://basescan.org',
    },
  },
} as const satisfies Chain

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

export const linea = {
  id: 59144,
  name: 'Linea',
  network: 'linea',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://linea-mainnet.infura.io/v3'],
    },
    public: {
      http: ['https://linea-mainnet.infura.io/v3'],
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'Linea Explorer',
      url: 'https://explorer.linea.build',
    },
    default: {
      name: 'Linea Explorer',
      url: 'https://explorer.linea.build',
    },
  },
} as const satisfies Chain

export const customChains = {
  zora,
  zoraTestnet,
  base,
  arbitrumNova,
  linea
} as const satisfies Record<string, Chain>