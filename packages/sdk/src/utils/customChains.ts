import { Chain } from 'viem'

export const ancient8 = {
  id: 888888888,
  name: 'Ancient8',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.ancient8.gg'],
      webSocket: ['wss://rpc.ancient8.gg'],
    },
    public: {
      http: ['https://rpc.ancient8.gg'],
      webSocket: ['wss://rpc.ancient8.gg'],
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'a8scan',
      url: 'https://scan.ancient8.gg',
    },
    default: {
      name: 'a8scan',
      url: 'https://scan.ancient8.gg',
    },
  },
} as const satisfies Chain

export const ancient8Testnet = {
  id: 28122024,
  name: 'Ancient8 Testnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpcv2-testnet.ancient8.gg'],
      webSocket: ['wss://rpcv2-testnet.ancient8.gg'],
    },
    public: {
      http: ['https://rpcv2-testnet.ancient8.gg'],
      webSocket: ['wss://rpcv2-testnet.ancient8.gg'],
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'a8scan',
      url: 'https://scanv2-testnet.ancient8.gg/',
    },
    default: {
      name: 'a8scan',
      url: 'https://scanv2-testnet.ancient8.gg/',
    },
  },
} as const satisfies Chain

export const frameTestnet = {
  id: 68840142,
  name: 'Frame Testnet',
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

export const blastSepolia = {
  id: 168587773,
  name: 'Blast Sepolia',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://sepolia.blast.io'],
    },
    public: {
      http: ['https://sepolia.blast.io'],
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'BlastScan Sepolia',
      url: 'https://testnet.blastscan.io',
    },
    default: {
      name: 'BlastScan Sepolia',
      url: 'https://testnet.blastscan.io',
    },
  },
} as const satisfies Chain

export const apexPop = {
  id: 70700,
  name: 'Apex',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.apex.proofofplay.com'],
    },
    public: {
      http: ['https://rpc.apex.proofofplay.com'],
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'Apex',
      url: 'https://explorer.apex.proofofplay.com',
    },
    default: {
      name: 'Apex',
      url: 'https://explorer.apex.proofofplay.com',
    },
  },
}

export const apexPopTestnet = {
  id: 70800,
  name: 'Apex Testnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc-pop-testnet-barret-oxaolmcfss.t.conduit.xyz'],
    },
    public: {
      http: ['https://rpc-pop-testnet-barret-oxaolmcfss.t.conduit.xyz'],
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'Apex Testnet',
      url: 'https://explorerl2new-pop-testnet-barret-oxaolmcfss.t.conduit.xyz',
    },
    default: {
      name: 'Apex Testnet',
      url: 'https://explorerl2new-pop-testnet-barret-oxaolmcfss.t.conduit.xyz',
    },
  },
}

export const blast = {
  id: 81457,
  name: 'Blast',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://blast.blockpi.network/v1/rpc/public'],
    },
    public: {
      http: ['https://blast.blockpi.network/v1/rpc/public'],
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'Blastscan',
      url: 'https://blastscan.io',
    },
    default: {
      name: 'Blastscan',
      url: 'https://blastscan.io',
    },
  },
}

export const astarZkEVM = {
  id: 3776,
  name: 'Astar ZkEVM',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.startale.com/astar-zkevm'],
    },
    public: {
      http: ['https://rpc.startale.com/astar-zkevm'],
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'Astar zkEVM',
      url: 'https://astar-zkevm.explorer.startale.com',
    },
    default: {
      name: 'Astar zkEVM',
      url: 'https://astar-zkevm.explorer.startale.com',
    },
  },
} as const satisfies Chain

export const redstoneTestnet = {
  id: 17001,
  name: 'Redstone Testnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.holesky.redstone.xyz'],
    },
    public: {
      http: ['https://rpc.holesky.redstone.xyz'],
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'Redstone Testnet',
      url: 'https://explorer.holesky.redstone.xyz',
    },
    default: {
      name: 'Redstone Testnet',
      url: 'https://explorer.holesky.redstone.xyz',
    },
  },
} as const satisfies Chain

export const redstone = {
  id: 690,
  name: 'Redstone',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.redstonechain.com'],
    },
    public: {
      http: ['https://rpc.redstonechain.com'],
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'Redstone',
      url: 'https://explorer.redstone.xyz',
    },
    default: {
      name: 'Redstone',
      url: 'https://explorer.redstone.xyz',
    },
  },
} as const satisfies Chain

export const customChains = {
  ancient8,
  ancient8Testnet,
  frameTestnet,
  blastSepolia,
  apexPop,
  apexPopTestnet,
  blast,
  astarZkEVM,
  redstoneTestnet,
  redstone,
} as const satisfies Record<string, Chain>
