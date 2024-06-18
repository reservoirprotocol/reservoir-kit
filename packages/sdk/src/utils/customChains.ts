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

export const garnet = {
  id: 17069,
  name: 'Garnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.garnet.qry.live'],
    },
    public: {
      http: ['https://rpc.garnet.qry.live'],
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'Garnet',
      url: 'https://explorer.garnet.qry.live',
    },
    default: {
      name: 'Garnet',
      url: 'https://explorer.garnet.qry.live',
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

export const degen = {
  id: 666666666,
  name: 'Degen',
  nativeCurrency: { name: 'DEGEN', symbol: 'DEGEN', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.degen.tips'],
    },
    public: {
      http: ['https://rpc.degen.tips'],
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'Degen Chain Explorer',
      url: 'https://explorer.degen.tips',
    },
    default: {
      name: 'Degen Chain Explorer',
      url: 'https://explorer.degen.tips',
    },
  },
} as const satisfies Chain

export const xai = {
  id: 660279,
  name: 'Xai',
  nativeCurrency: { name: 'Xai', symbol: 'XAI', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://xai-chain.net/rpc'],
    },
    public: {
      http: ['https://xai-chain.net/rpc'],
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'Xai',
      url: 'https://explorer.xai-chain.net',
    },
    default: {
      name: 'Xai',
      url: 'https://explorer.xai-chain.net',
    },
  },
} as const satisfies Chain

export const seiTestnet = {
  id: 713715,
  name: 'Sei Testnet',
  nativeCurrency: { name: 'Sei', symbol: 'SEI', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://evm-rpc-arctic-1.sei-apis.com'],
    },
    public: {
      http: ['https://evm-rpc-arctic-1.sei-apis.com'],
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'Sei Testnet',
      url: 'https://seistream.app',
    },
    default: {
      name: 'Sei Testnet',
      url: 'https://seistream.app',
    },
  },
} as const satisfies Chain

export const cyber = {
  id: 7560,
  name: 'Cyber',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://cyber.alt.technology'],
    },
    public: {
      http: ['https://cyber.alt.technology'],
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'Cyber Explorer',
      url: 'https://cyberscan.co',
    },
    default: {
      name: 'Cyber Explorer',
      url: 'https://cyberscan.co',
    },
  },
} as const satisfies Chain

export const bitlayer = {
  id: 200901,
  name: 'Bitlayer',
  nativeCurrency: { name: 'Bitcoin', symbol: 'BTC', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.bitlayer.org'],
    },
    public: {
      http: ['https://rpc.bitlayer.org'],
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'Bitlayer Scan',
      url: 'https://www.btrscan.com',
    },
    default: {
      name: 'Bitlayer Scan',
      url: 'https://www.btrscan.com',
    },
  },
} as const satisfies Chain

export const sei = {
  id: 1329,
  name: 'Sei',
  nativeCurrency: { name: 'Sei', symbol: 'SEI', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://evm-rpc.sei-apis.com'],
    },
    public: {
      http: ['https://evm-rpc.sei-apis.com'],
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'Sei Scan',
      url: 'https://seitrace.com',
    },
    default: {
      name: 'Sei Scan',
      url: 'https://seitrace.com',
    },
  },
} as const satisfies Chain

export const nebula = {
  id: 1482601649,
  name: 'Nebula',
  nativeCurrency: { name: 'sFUEL', symbol: 'sFUEL', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://mainnet.skalenodes.com/v1/green-giddy-denebola'],
    },
    public: {
      http: ['https://mainnet.skalenodes.com/v1/green-giddy-denebola'],
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'SKALE Explorer',
      url: 'https://green-giddy-denebola.explorer.mainnet.skalenodes.com',
    },
    default: {
      name: 'SKALE Explorer',
      url: 'https://green-giddy-denebola.explorer.mainnet.skalenodes.com',
    },
  },
} as const satisfies Chain

export const b3Testnet = {
  id: 1993,
  name: 'B3 Testnet',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://sepolia.b3.fun/http'],
    },
    public: {
      http: ['https://sepolia.b3.fun/http'],
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'B3 Sepolia Explorer',
      url: 'https://sepolia.explorer.b3.fun',
    },
    default: {
      name: 'B3 Sepolia Explorer',
      url: 'https://sepolia.explorer.b3.fun',
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
  garnet,
  redstone,
  degen,
  xai,
  seiTestnet,
  cyber,
  bitlayer,
  sei,
  nebula,
  b3Testnet,
} as const satisfies Record<string, Chain>
