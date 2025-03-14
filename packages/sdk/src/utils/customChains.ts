import { Chain } from 'viem'

export const mainnet = {
  id: 1,
  name: 'Ethereum',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        'https://ethereum-rpc.publicnode.com',
        'https://mainnet.gateway.tenderly.co',
        'https://rpc.flashbots.net',
        'https://rpc.mevblocker.io',
        'https://eth.drpc.org',
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'Etherscan',
      url: 'https://etherscan.io',
      apiUrl: 'https://api.etherscan.io/api',
    },
  },
  contracts: {
    ensRegistry: {
      address: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    },
    ensUniversalResolver: {
      address: '0xce01f8eee7E479C928F8919abD53E553a36CeF67',
      blockCreated: 19_258_213,
    },
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 14_353_601,
    },
  },
} as const satisfies Chain

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
      http: ['https://rpc.blast.io'],
    },
    public: {
      http: ['https://rpc.blast.io'],
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
} as const satisfies Chain

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
      url: 'https://explorer.boss.proofofplay.com',
    },
    default: {
      name: 'Boss Explorer',
      url: 'https://explorer.boss.proofofplay.com',
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
      url: 'https://apescan.io',
    },
    default: {
      name: 'Apechain Explorer',
      url: 'https://apescan.io',
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
      url: 'https://shapescan.xyz',
    },
    default: {
      name: 'Shape Explorer',
      url: 'https://shapescan.xyz',
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
      url: 'https://soneium-minato.blockscout.com',
    },
    default: {
      name: 'Minato Explorer',
      url: 'https://soneium-minato.blockscout.com',
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

export const flow = {
  id: 747,
  name: 'Flow',
  nativeCurrency: { name: 'Flow', symbol: 'FLOW', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://mainnet.evm.nodes.onflow.org'],
    },
    public: {
      http: ['https://mainnet.evm.nodes.onflow.org'],
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'Flow Explorer',
      url: 'https://evm.flowscan.io',
    },
    default: {
      name: 'Flow Explorer',
      url: 'https://evm.flowscan.io',
    },
  },
} as const satisfies Chain

export const zero = {
  id: 543210,
  name: 'Zero',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://zero-network.calderachain.xyz'],
    },
    public: {
      http: ['https://zero-network.calderachain.xyz'],
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'Zero Explorer',
      url: 'https://explorer.zero.network',
    },
    default: {
      name: 'Zero Explorer',
      url: 'https://explorer.zero.network',
    },
  },
} as const satisfies Chain

export const zeroTestnet = {
  id: 43210,
  name: 'Zero Testnet',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://zerion-testnet-proofs.rpc.caldera.xyz/http'],
    },
    public: {
      http: ['https://zerion-testnet-proofs.rpc.caldera.xyz/http'],
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'Zero Testnet Explorer',
      url: 'https://zerion-testnet-proofs.explorer.caldera.xyz',
    },
    default: {
      name: 'Zero Testnet Explorer',
      url: 'https://zerion-testnet-proofs.explorer.caldera.xyz',
    },
  },
} as const satisfies Chain

export const abstract = {
  id: 2741,
  name: 'Abstract',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.fsd.adfasd32442ds.com'],
    },
    public: {
      http: ['https://rpc.fsd.adfasd32442ds.com'],
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'Abstract Explorer',
      url: 'https://abscan.org',
    },
    default: {
      name: 'Abstract Explorer',
      url: 'https://abscan.org',
    },
  },
} as const satisfies Chain

export const animeTestnet = {
  id: 6900,
  name: 'Anime Testnet',
  nativeCurrency: { name: 'ANIME', symbol: 'ANIME', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc-animechain-testnet-i8yja6a1a0.t.conduit.xyz'],
    },
    public: {
      http: ['https://rpc-animechain-testnet-i8yja6a1a0.t.conduit.xyz'],
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'Anime Testnet Explorer',
      url: 'https://testnet-explorer.anime.xyz',
    },
    default: {
      name: 'Anime Testnet Explorer',
      url: 'https://testnet-explorer.anime.xyz',
    },
  },
} as const satisfies Chain

export const monadDevnet = {
  id: 41454,
  name: 'Monad Devnet',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        'https://devnet1.monad.xyz/rpc/diJoIRvXonYUWPhZNBtJAv1ffPjrkYBXXewh4PZe',
      ],
    },
    public: {
      http: [
        'https://devnet1.monad.xyz/rpc/diJoIRvXonYUWPhZNBtJAv1ffPjrkYBXXewh4PZe',
      ],
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'Monad Devnet Explorer',
      url: 'https://brightstar-884.devnet1.monad.xyz',
    },
    default: {
      name: 'Monad Devnet Explorer',
      url: 'https://brightstar-884.devnet1.monad.xyz',
    },
  },
} as const satisfies Chain

export const game7 = {
  id: 2187,
  name: 'game7',
  nativeCurrency: { name: 'Game7', symbol: 'G7', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://mainnet-rpc.game7.io'],
    },
    public: {
      http: ['https://mainnet-rpc.game7.io'],
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'G7 Network Explorer',
      url: 'https://mainnet.game7.io',
    },
    default: {
      name: 'G7 Network Explorer',
      url: 'https://mainnet.game7.io',
    },
  },
} as const satisfies Chain

export const creatorTestnet = {
  id: 4654,
  name: 'Creator Testnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://creator-testnet.rpc.caldera.xyz/http'],
    },
    public: {
      http: ['https://creator-testnet.rpc.caldera.xyz/http'],
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'Creator Testnet Explorer',
      url: 'https://creator-testnet.explorer.caldera.xyz',
    },
    default: {
      name: 'Creator Testnet Explorer',
      url: 'https://creator-testnet.explorer.caldera.xyz',
    },
  },
} as const satisfies Chain

export const soneium = {
  id: 1868,
  name: 'Soneium',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://yellow-flash-rpc.dwellir.com'],
    },
    public: {
      http: ['https://yellow-flash-rpc.dwellir.com'],
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'Soneium Explorer',
      url: 'https://vk9a3tgpne6qmub8.blockscout.com',
    },
    default: {
      name: 'Soneium Explorer',
      url: 'https://vk9a3tgpne6qmub8.blockscout.com',
    },
  },
} as const satisfies Chain

export const storyOdyssey = {
  id: 1516,
  name: 'Story Odyssey',
  nativeCurrency: { name: 'IP', symbol: 'IP', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.odyssey.storyrpc.io'],
    },
    public: {
      http: ['https://rpc.odyssey.storyrpc.io'],
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'Story Odyssey Explorer',
      url: 'https://odyssey.storyscan.xyz',
    },
    default: {
      name: 'Story Odyssey Explorer',
      url: 'https://odyssey.storyscan.xyz',
    },
  },
} as const satisfies Chain

export const monadTestnet = {
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: { name: 'Monad', symbol: 'MON', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.monad.xyz'],
    },
    public: {
      http: ['https://testnet-rpc.monad.xyz'],
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'Monad Testnet Explorer',
      url: 'https://testnet.monadexplorer.com',
    },
    default: {
      name: 'Monad Testnet Explorer',
      url: 'https://testnet.monadexplorer.com',
    },
  },
} as const satisfies Chain

export const ink = {
  id: 57073,
  name: 'Ink',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc-gel.inkonchain.com'],
    },
    public: {
      http: ['https://rpc-gel.inkonchain.com'],
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'Ink Explorer',
      url: 'https://explorer.inkonchain.com',
    },
    default: {
      name: 'Ink Explorer',
      url: 'https://explorer.inkonchain.com',
    },
  },
} as const satisfies Chain

export const berachain = {
  id: 80094,
  name: 'Berachain',
  nativeCurrency: { name: 'Bera', symbol: 'BERA', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.berachain.com'],
    },
    public: {
      http: ['https://rpc.berachain.com'],
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'Berachain Explorer',
      url: 'https://berascan.com',
    },
    default: {
      name: 'Berachain Explorer',
      url: 'https://berascan.com',
    },
  },
} as const satisfies Chain

export const anime = {
  id: 69000,
  name: 'Anime',
  nativeCurrency: { name: 'Anime', symbol: 'ANIME', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc-animechain-39xf6m45e3.t.conduit.xyz'],
    },
    public: {
      http: ['https://rpc-animechain-39xf6m45e3.t.conduit.xyz'],
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
  flow,
  zero,
  zeroTestnet,
  abstract,
  animeTestnet,
  monadDevnet,
  game7,
  creatorTestnet,
  soneium,
  storyOdyssey,
  monadTestnet,
  ink,
  berachain,
  anime,
} as const satisfies Record<string, Chain>
