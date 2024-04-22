import { Address, zeroAddress } from 'viem'

export type PaymentToken = {
  chainId: number
  address: Address
  symbol: string
  decimals: number
  name?: string
}

export const chainPaymentTokensMap = {
  // Mainnet
  1: [
    {
      chainId: 1,
      address: zeroAddress,
      symbol: 'ETH',
      name: 'ETH',
      decimals: 18,
    },
    {
      chainId: 1,
      address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      symbol: 'USDC',
      name: 'USDC',
      decimals: 6,
    },
    {
      chainId: 1,
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      symbol: 'WETH',
      name: 'WETH',
      decimals: 18,
    },
  ],

  // Optimism
  10: [
    {
      chainId: 10,
      address: zeroAddress,
      symbol: 'ETH',
      name: 'Optimism ETH',
      decimals: 18,
    },
    {
      chainId: 10,
      address: '0x4200000000000000000000000000000000000006',
      symbol: 'WETH',
      name: 'WETH',
      decimals: 18,
    },
    {
      chainId: 10,
      address: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
      symbol: 'USDC',
      name: 'USDC',
      decimals: 6,
    },
  ],

  // Polygon
  137: [
    {
      chainId: 137,
      address: zeroAddress,
      symbol: 'MATIC',
      name: 'MATIC',
      decimals: 18,
    },
    {
      chainId: 137,
      address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
      symbol: 'WETH',
      name: 'WETH',
      decimals: 18,
    },
    {
      chainId: 137,
      address: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',
      symbol: 'USDC',
      name: 'USDC',
      decimals: 6,
    },
  ],

  // Amoy
  80002: [
    {
      chainId: 80002,
      address: zeroAddress,
      symbol: 'MATIC',
      name: 'MATIC',
      decimals: 18,
    },
    {
      chainId: 80002,
      address: '0x0ae690aad8663aab12a671a6a0d74242332de85f',
      symbol: 'WMATIC',
      name: 'WMATIC',
      decimals: 18,
    },
  ],

  // Arbitrum
  42161: [
    {
      chainId: 42161,
      address: zeroAddress,
      symbol: 'ETH',
      name: 'Arbitrum ETH',
      decimals: 18,
    },
    {
      chainId: 42161,
      address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
      symbol: 'WETH',
      name: 'WETH',
      decimals: 18,
    },
    {
      chainId: 42161,
      address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
      symbol: 'USDC',
      name: 'USDC',
      decimals: 6,
    },
  ],

  // Arbitrum Nova
  42170: [
    {
      chainId: 42170,
      address: zeroAddress,
      symbol: 'ETH',
      name: 'Arbitrum Nova ETH',
      decimals: 18,
    },
    {
      chainId: 42170,
      address: '0x722e8bdd2ce80a4422e880164f2079488e115365',
      symbol: 'WETH',
      name: 'WETH',
      decimals: 18,
    },
    {
      chainId: 42170,
      address: '0x750ba8b76187092B0D1E87E28daaf484d1b5273b',
      symbol: 'USDC',
      name: 'USDC',
      decimals: 6,
    },
  ],

  // Avalanche
  43114: [
    {
      chainId: 43114,
      address: zeroAddress,
      symbol: 'ETH',
      name: 'Avalanche ETH',
      decimals: 18,
    },
    {
      chainId: 43114,
      address: '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7',
      symbol: 'WETH',
      name: 'WETH',
      decimals: 18,
    },
    {
      chainId: 43114,
      address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
      symbol: 'USDC',
      name: 'USDC',
      decimals: 6,
    },
  ],

  // Sepolia
  11155111: [
    {
      chainId: 11155111,
      address: zeroAddress,
      symbol: 'ETH',
      name: 'Sepolia ETH',
      decimals: 18,
    },
    {
      chainId: 11155111,
      address: '0x7b79995e5f793a07bc00c21412e50ecae098e7f9',
      symbol: 'WETH',
      name: 'WETH',
      decimals: 18,
    },
  ],

  // Base
  8453: [
    {
      chainId: 8453,
      address: zeroAddress,
      symbol: 'ETH',
      name: 'Base ETH',
      decimals: 18,
    },
    {
      chainId: 8453,
      address: '0x4200000000000000000000000000000000000006',
      symbol: 'WETH',
      name: 'WETH',
      decimals: 18,
    },
    {
      chainId: 8453,
      address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
      symbol: 'USDC',
      name: 'USDC',
      decimals: 6,
    },
  ],

  // Base Sepolia
  84532: [
    {
      chainId: 84532,
      address: zeroAddress,
      symbol: 'ETH',
      name: 'Base Sepolia ETH',
      decimals: 18,
    },
    {
      chainId: 84531,
      address: '0x4200000000000000000000000000000000000006',
      symbol: 'WETH',
      name: 'WETH',
      decimals: 18,
    },
  ],

  // Scroll Testnet
  534353: [
    {
      chainId: 534353,
      address: zeroAddress,
      symbol: 'ETH',
      name: 'Scroll Testnet ETH',
      decimals: 18,
    },
    {
      chainId: 534353,
      address: '0xa1EA0B2354F5A344110af2b6AD68e75545009a03',
      symbol: 'WETH',
      name: 'WETH',
      decimals: 18,
    },
    {
      chainId: 534353,
      address: '0xA0D71B9877f44C744546D649147E3F1e70a93760',
      symbol: 'USDC',
      name: 'USDC',
      decimals: 6,
    },
  ],

  // Scroll
  534352: [
    {
      chainId: 534352,
      address: zeroAddress,
      symbol: 'ETH',
      name: 'Scroll ETH',
      decimals: 18,
    },
    {
      chainId: 534352,
      address: '0x5300000000000000000000000000000000000004',
      symbol: 'WETH',
      name: 'WETH',
      decimals: 18,
    },
  ],

  // Linea
  59144: [
    {
      chainId: 59144,
      address: zeroAddress,
      symbol: 'ETH',
      name: 'ETH',
      decimals: 18,
    },
    {
      chainId: 59144,
      address: '0xe5d7c2a44ffddf6b295a15c148167daaaf5cf34f',
      symbol: 'WETH',
      name: 'WETH',
      decimals: 18,
    },
    {
      chainId: 59144,
      address: '0x176211869cA2b568f2A7D4EE941E073a821EE1ff',
      symbol: 'USDC',
      name: 'USDC',
      decimals: 6,
    },
  ],

  // Bsc
  56: [
    {
      chainId: 56,
      address: zeroAddress,
      symbol: 'ETH',
      name: 'BSC ETH',
      decimals: 18,
    },
    {
      chainId: 56,
      address: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
      symbol: 'WBNB',
      name: 'WBNB',
      decimals: 18,
    },
    {
      chainId: 56,
      address: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
      symbol: 'USDC',
      name: 'USDC',
      decimals: 6,
    },
  ],
  //opbnb
  204: [
    {
      chainId: 204,
      address: zeroAddress,
      symbol: 'ETH',
      name: 'Op BNB ETH',
      decimals: 18,
    },
    {
      chainId: 204,
      address: '0x4200000000000000000000000000000000000006',
      symbol: 'WBNB',
      name: 'WBNB',
      decimals: 18,
    },
  ],
  // Zora
  7777777: [
    {
      chainId: 7777777,
      address: zeroAddress,
      symbol: 'ETH',
      name: 'Zora ETH',
      decimals: 18,
    },
    {
      chainId: 7777777,
      address: '0x4200000000000000000000000000000000000006',
      symbol: 'WETH',
      name: 'WETH',
      decimals: 18,
    },
  ],

  // Zora Testnet
  999: [
    {
      chainId: 999,
      address: zeroAddress,
      symbol: 'ETH',
      name: 'Zora Testnet ETH',
      decimals: 18,
    },
    {
      chainId: 999,
      address: '0x8a5027ea12f45a13deb6CB96A07913c6e192BE84',
      symbol: 'WETH',
      name: 'WETH',
      decimals: 18,
    },
  ],

  // zkSync
  324: [
    {
      chainId: 324,
      address: zeroAddress,
      symbol: 'ETH',
      name: 'zkSync ETH',
      decimals: 18,
    },
    {
      chainId: 324,
      address: '0x5aea5775959fbc2557cc8789bc1bf90a239d9a91',
      symbol: 'WETH',
      name: 'WETH',
      decimals: 18,
    },
  ],

  // polygonZkEvm
  1101: [
    {
      chainId: 1101,
      address: zeroAddress,
      symbol: 'ETH',
      name: 'Polygon zkEVM ETH',
      decimals: 18,
    },
    {
      chainId: 1101,
      address: '0x4f9a0e7fd2bf6067db6994cf12e4495df938e6e9',
      symbol: 'WETH',
      name: 'WETH',
      decimals: 18,
    },
  ],

  // Ancient8
  888888888: [
    {
      chainId: 888888888,
      address: zeroAddress,
      symbol: 'ETH',
      name: 'Ancient8 ETH',
      decimals: 18,
    },
    {
      chainId: 888888888,
      address: '0x4200000000000000000000000000000000000006',
      symbol: 'WETH',
      name: 'WETH',
      decimals: 18,
    },
  ],

  // Ancient8 Testnet
  28122024: [
    {
      chainId: 28122024,
      address: zeroAddress,
      symbol: 'ETH',
      name: 'Ancient8 Testnet ETH',
      decimals: 18,
    },
    {
      chainId: 28122024,
      address: '0x4200000000000000000000000000000000000006',
      symbol: 'WETH',
      name: 'WETH',
      decimals: 18,
    },
  ],

  // Frame Testnet
  68840142: [
    {
      chainId: 68840142,
      address: zeroAddress,
      symbol: 'ETH',
      name: 'Frame Testnet ETH',
      decimals: 18,
    },
    {
      chainId: 68840142,
      address: '0x822b4c4713433c6b88547845850a39343bf0957e',
      symbol: 'WETH',
      name: 'WETH',
      decimals: 18,
    },
  ],

  //Apex PoP
  70700: [
    {
      chainId: 70700,
      address: zeroAddress,
      symbol: 'ETH',
      name: 'ETH',
      decimals: 18,
    },
    {
      chainId: 70700,
      address: '0x77684A04145a5924eFCE0D92A7c4a2A2E8C359de',
      symbol: 'WETH',
      name: 'WETH',
      decimals: 18,
    },
  ],

  //Apex PoP Testnet
  70800: [
    {
      chainId: 70800,
      address: zeroAddress,
      symbol: 'ETH',
      name: 'ETH',
      decimals: 18,
    },
    {
      chainId: 70800,
      address: '0xBfB86801053600dd3C7FCBa6d5E85017a64cE728',
      symbol: 'WETH',
      name: 'WETH',
      decimals: 18,
    },
  ],

  //Blast
  81457: [
    {
      chainId: 81457,
      address: zeroAddress,
      symbol: 'ETH',
      name: 'ETH',
      decimals: 18,
    },
    {
      chainId: 81457,
      address: '0x4300000000000000000000000000000000000004',
      symbol: 'WETH',
      name: 'WETH',
      decimals: 18,
    },
  ],
  //Blast sepolia
  168587773: [
    {
      chainId: 168587773,
      address: zeroAddress,
      symbol: 'ETH',
      name: 'ETH',
      decimals: 18,
    },
    {
      chainId: 168587773,
      address: '0x4200000000000000000000000000000000000023',
      symbol: 'WETH',
      name: 'WETH',
      decimals: 18,
    },
  ],
  // Astar zkEVM
  3776: [
    {
      chainId: 3776,
      address: zeroAddress,
      symbol: 'ETH',
      name: 'ETH',
      decimals: 18,
    },
    {
      chainId: 3776,
      address: '0xE9CC37904875B459Fa5D0FE37680d36F1ED55e38',
      symbol: 'WETH',
      name: 'WETH',
      decimals: 18,
    },
  ],
  // Garnet
  17069: [
    {
      chainId: 17069,
      address: zeroAddress,
      symbol: 'ETH',
      name: 'ETH',
      decimals: 18,
    },
    {
      chainId: 17069,
      address: '0x4200000000000000000000000000000000000006',
      symbol: 'WETH',
      name: 'WETH',
      decimals: 18,
    },
  ],

  // Redstone
  690: [
    {
      chainId: 690,
      address: zeroAddress,
      symbol: 'ETH',
      name: 'ETH',
      decimals: 18,
    },
    {
      chainId: 690,
      address: '0x4200000000000000000000000000000000000006',
      symbol: 'WETH',
      name: 'WETH',
      decimals: 18,
    },
  ],

  // Berachain Testnet
  80085: [
    {
      chainId: 80085,
      address: zeroAddress,
      symbol: 'BERA',
      name: 'BERA',
      decimals: 18,
    },
    {
      chainId: 80085,
      address: '0x5806e416da447b267cea759358cf22cc41fae80f',
      symbol: 'WBERA',
      name: 'WBERA',
      decimals: 18,
    },
  ],
} as Record<number, PaymentToken[]>
