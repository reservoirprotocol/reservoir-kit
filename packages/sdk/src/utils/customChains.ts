import { Chain } from "viem";

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

export const frameTestnet = {
  id: 68840142,
  name: 'Frame Testnet',
  network: 'frametestnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.frame.xyz/http'],
      webSocket: ['https://rpc.testnet.frame.xyz/http'],
    },
    public: {
      http: ['https://rpc.testnet.frame.xyz/http'],
      webSocket: ['https://rpc.testnet.frame.xyz/http'],
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'Frame Explorer',
      url: 'https://explorer.testnet.frame.xyz',
    },
    default: {
      name: 'Frame Explorer',
      url: 'https://explorer.testnet.frame.xyz',
    },
  },
} as const satisfies Chain

export const customChains = {
  ancient8Testnet,
  frameTestnet
} as const satisfies Record<string, Chain>