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

export const customChains = {
  zora,
  zoraTestnet
} as const satisfies Record<string, Chain>