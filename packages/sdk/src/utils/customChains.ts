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

export const customChains = {
  ancient8Testnet,
} as const satisfies Record<string, Chain>