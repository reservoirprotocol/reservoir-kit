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

export const flowPreviewnet = {
  id: 646,
  name: 'Flow Previewnet',
  nativeCurrency: { name: 'Flow', symbol: 'FLOW', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://previewnet.evm.nodes.onflow.org'],
    },
    public: {
      http: ['https://previewnet.evm.nodes.onflow.org'],
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'Flow Previewnet Explorer',
      url: 'https://eth.flowscan.io/',
    },
    default: {
      name: 'Flow Previewnet Explorer',
      url: 'https://eth.flowscan.io/',
    },
  },
} as const satisfies Chain

export const cloud = {
  id: 70805,
  name: 'Cloud',
  nativeCurrency: { name: 'Eth', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc-pop-testnet-cloud-fmg1z6e0a9.t.conduit.xyz'],
    },
    public: {
      http: ['https://rpc-pop-testnet-cloud-fmg1z6e0a9.t.conduit.xyz'],
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'Cloud Explorer',
      url: 'https://explorer-pop-testnet-cloud-fmg1z6e0a9.t.conduit.xyz',
    },
    default: {
      name: 'Cloud Explorer',
      url: 'https://explorer-pop-testnet-cloud-fmg1z6e0a9.t.conduit.xyz',
    },
  },
} as const satisfies Chain

export const game7Testnet = {
  id: 13746,
  name: 'Game7 Testnet',
  nativeCurrency: { name: 'TG7T', symbol: 'TG7T', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc-game7-testnet-0ilneybprf.t.conduit.xyz'],
    },
    public: {
      http: ['https://rpc-game7-testnet-0ilneybprf.t.conduit.xyz'],
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'Game7 Testnet Explorer',
      url: 'https://explorer-game7-testnet-0ilneybprf.t.conduit.xyz',
    },
    default: {
      name: 'Game7 Testnet Explorer',
      url: 'https://explorer-game7-testnet-0ilneybprf.t.conduit.xyz',
    },
  },
} as const satisfies Chain

export const boss = {
  id: 70701,
  name: 'Boss',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.boss.proofofplay.com'],
    },
    public: {
      http: ['https://rpc.boss.proofofplay.com'],
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'Boss Explorer',
      url: 'https://explorer-proofofplay-boss-mainnet.t.conduit.xyz',
    },
    default: {
      name: 'Boss Explorer',
      url: 'https://explorer-proofofplay-boss-mainnet.t.conduit.xyz',
    },
  },
} as const satisfies Chain

export const forma = {
  id: 984122,
  name: 'Forma',
  nativeCurrency: { name: 'TIA', symbol: 'TIA', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.forma.art'],
    },
    public: {
      http: ['https://rpc.forma.art'],
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'Forma Explorer',
      url: 'https://explorer.forma.art',
    },
    default: {
      name: 'Forma Explorer',
      url: 'https://explorer.forma.art',
    },
  },
} as const satisfies Chain

export const formaSketchpad = {
  id: 984123,
  name: 'Forma Sketchpad',
  nativeCurrency: { name: 'TIA', symbol: 'TIA', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.sketchpad-1.forma.art'],
    },
    public: {
      http: ['https://rpc.sketchpad-1.forma.art'],
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'Forma Sketchpad Explorer',
      url: 'https://explorer.sketchpad-1.forma.art',
    },
    default: {
      name: 'Forma Sketchpad Explorer',
      url: 'https://explorer.sketchpad-1.forma.art',
    },
  },
} as const satisfies Chain

export const b3 = {
  id: 8333,
  name: 'B3',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://mainnet-rpc.b3.fun/http'],
    },
    public: {
      http: ['https://mainnet-rpc.b3.fun/http'],
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'B3 Explorer',
      url: 'https://explorer.b3.fun',
    },
    default: {
      name: 'B3 Explorer',
      url: 'https://explorer.b3.fun',
    },
  },
} as const satisfies Chain

export const apechain = {
  id: 33139,
  name: 'Apechain',
  nativeCurrency: { name: 'ApeCoin', symbol: 'APE', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://apechain.calderachain.xyz/http'],
    },
    public: {
      http: ['https://apechain.calderachain.xyz/http'],
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'Apechain Explorer',
      url: 'https://apechain.calderaexplorer.xyz',
    },
    default: {
      name: 'Apechain Explorer',
      url: 'https://apechain.calderaexplorer.xyz',
    },
  },
} as const satisfies Chain

export const curtis = {
  id: 33111,
  name: 'Curtis',
  nativeCurrency: { name: 'ApeCoin', symbol: 'APE', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://curtis.rpc.caldera.xyz/http'],
    },
    public: {
      http: ['https://curtis.rpc.caldera.xyz/http'],
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'Curtis Explorer',
      url: 'https://curtis.explorer.caldera.xyz',
    },
    default: {
      name: 'Curtis Explorer',
      url: 'https://curtis.explorer.caldera.xyz',
    },
  },
} as const satisfies Chain

export const shape = {
  id: 360,
  name: 'Shape',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://mainnet.shape.network'],
    },
    public: {
      http: ['https://mainnet.shape.network'],
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'Shape Explorer',
      url: 'https://internal-shaper-explorer.alchemypreview.com',
    },
    default: {
      name: 'Shape Explorer',
      url: 'https://internal-shaper-explorer.alchemypreview.com',
    },
  },
} as const satisfies Chain

export const shapeSepolia = {
  id: 11011,
  name: 'Shape Sepolia',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://sepolia.shape.network'],
    },
    public: {
      http: ['https://sepolia.shape.network'],
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'Shape Sepolia Explorer',
      url: 'https://explorer-sepolia.shape.network',
    },
    default: {
      name: 'Shape Sepolia Explorer',
      url: 'https://explorer-sepolia.shape.network',
    },
  },
} as const satisfies Chain

export const abstractTestnet = {
  id: 11124,
  name: 'Abstract Testnet',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://api.testnet.abs.xyz'],
    },
    public: {
      http: ['https://api.testnet.abs.xyz'],
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'Abstract Testnet Explorer',
      url: 'https://explorer.testnet.abs.xyz',
    },
    default: {
      name: 'Abstract Testnet Explorer',
      url: 'https://explorer.testnet.abs.xyz',
    },
  },
} as const satisfies Chain

export const minato = {
  id: 1946,
  name: 'Minato',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.minato.soneium.org'],
    },
    public: {
      http: ['https://rpc.minato.soneium.org'],
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'Minato Explorer',
      url: 'https://explorer-testnet.soneium.org',
    },
    default: {
      name: 'Minato Explorer',
      url: 'https://explorer-testnet.soneium.org',
    },
  },
} as const satisfies Chain

export const hychain = {
  id: 2911,
  name: 'Hychain',
  nativeCurrency: { name: 'Hychain', symbol: 'TOPIA', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.hychain.com/http'],
    },
    public: {
      http: ['https://rpc.hychain.com/http'],
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'Hychain Explorer',
      url: 'https://explorer.hychain.com',
    },
    default: {
      name: 'Hychain Explorer',
      url: 'https://explorer.hychain.com',
    },
  },
} as const satisfies Chain

export const hychainTestnet = {
  id: 29112,
  name: 'Hychain Testnet',
  nativeCurrency: { name: 'Hychain', symbol: 'TOPIA', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.hychain.com/http'],
    },
    public: {
      http: ['https://testnet-rpc.hychain.com/http'],
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'Hychain Testnet Explorer',
      url: 'https://testnet.explorer.hychain.com',
    },
    default: {
      name: 'Hychain Testnet Explorer',
      url: 'https://testnet.explorer.hychain.com',
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
  flowPreviewnet,
  cloud,
  game7Testnet,
  boss,
  forma,
  formaSketchpad,
  b3,
  apechain,
  curtis,
  shape,
  shapeSepolia,
  abstractTestnet,
  minato,
  hychain,
  hychainTestnet,
} as const satisfies Record<string, Chain>
