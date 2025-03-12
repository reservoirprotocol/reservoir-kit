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
      chainId: 84532,
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

  // Soneium
  1868: [
    {
      chainId: 1868,
      address: zeroAddress,
      symbol: 'ETH',
      name: 'Soneium ETH',
      decimals: 18,
    },
    {
      chainId: 1868,
      address: '0x4200000000000000000000000000000000000006',
      symbol: 'WETH',
      name: 'WETH',
      decimals: 18,
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
  80084: [
    {
      chainId: 80084,
      address: zeroAddress,
      symbol: 'BERA',
      name: 'BERA',
      decimals: 18,
    },
    {
      chainId: 80084,
      address: '0x7507c1dc16935b82698e4c63f2746a2fcf994df8',
      symbol: 'WBERA',
      name: 'WBERA',
      decimals: 18,
    },
  ],

  // Degen
  666666666: [
    {
      chainId: 666666666,
      address: zeroAddress,
      symbol: 'DEGEN',
      name: 'DEGEN',
      decimals: 18,
    },
  ],

  // Xai
  660279: [
    {
      chainId: 660279,
      address: zeroAddress,
      symbol: 'XAI',
      name: 'Xai',
      decimals: 18,
    },
    {
      chainId: 660279,
      address: '0x3fb787101dc6be47cfe18aeee15404dcc842e6af',
      symbol: 'WXAI',
      name: 'WXAI',
      decimals: 18,
    },
  ],

  // Nebula
  1482601649: [
    {
      chainId: 1482601649,
      address: '0xab01bad2c86e24d371a13ed6367bdca819589c5d',
      symbol: 'ETH',
      name: 'Europa ETH',
      decimals: 18,
    },
    {
      chainId: 1482601649,
      address: '0xcc205196288b7a26f6d43bbd68aaa98dde97276d',
      symbol: 'USDC',
      name: 'Europa USDC',
      decimals: 6,
    },
    {
      chainId: 1482601649,
      address: '0x7f73b66d4e6e67bcdeaf277b9962addcdabbfc4d',
      symbol: 'SKL',
      name: 'Europa SKL',
      decimals: 18,
    },
  ],

  // Sei Testnet
  713715: [
    {
      chainId: 713715,
      address: zeroAddress,
      symbol: 'SEI',
      name: 'SEI',
      decimals: 18,
    },
    {
      chainId: 713715,
      address: '0x48a9b22b80f566e88f0f1dcc90ea15a8a3bae8a4',
      symbol: 'WSEI',
      name: 'WSEI',
      decimals: 18,
    },
  ],

  // Cyber
  7560: [
    {
      chainId: 7560,
      address: zeroAddress,
      symbol: 'ETH',
      name: 'ETH',
      decimals: 18,
    },
    {
      chainId: 7560,
      address: '0x4200000000000000000000000000000000000006',
      symbol: 'WETH',
      name: 'WETH',
      decimals: 18,
    },
  ],

  // Bitlayer
  200901: [
    {
      chainId: 200901,
      address: zeroAddress,
      symbol: 'BTC',
      name: 'Bitcoin',
      decimals: 18,
    },
    {
      chainId: 200901,
      address: '0xff204e2681a6fa0e2c3fade68a1b28fb90e4fc5f',
      symbol: 'WBTC',
      name: 'Wrapped BTC',
      decimals: 18,
    },
  ],

  // Sei Testnet
  1329: [
    {
      chainId: 1329,
      address: zeroAddress,
      symbol: 'SEI',
      name: 'SEI',
      decimals: 18,
    },
    {
      chainId: 1329,
      address: '0xE30feDd158A2e3b13e9badaeABaFc5516e95e8C7',
      symbol: 'WSEI',
      name: 'WSEI',
      decimals: 18,
    },
  ],

  // B3 Testnet
  1993: [
    {
      chainId: 1993,
      address: zeroAddress,
      symbol: 'ETH',
      name: 'ETH',
      decimals: 18,
    },
    {
      chainId: 1993,
      address: '0x48a9b22b80f566e88f0f1dcc90ea15a8a3bae8a4',
      symbol: 'WETH',
      name: 'WETH',
      decimals: 18,
    },
  ],

  // Flow Previewnet
  646: [
    {
      chainId: 646,
      address: zeroAddress,
      symbol: 'FLOW',
      name: 'Flow',
      decimals: 18,
    },
    {
      chainId: 646,
      address: '0x48a9b22b80f566e88f0f1dcc90ea15a8a3bae8a4',
      symbol: 'WFLOW',
      name: 'WFLOW',
      decimals: 18,
    },
  ],

  // Cloud
  70805: [
    {
      chainId: 70805,
      address: zeroAddress,
      symbol: 'ETH',
      name: 'Ether',
      decimals: 18,
    },
    {
      chainId: 70805,
      address: '0x48a9b22b80f566e88f0f1dcc90ea15a8a3bae8a4',
      symbol: 'WETH',
      name: 'WETH',
      decimals: 18,
    },
  ],

  // Game7 Testnet
  13746: [
    {
      chainId: 13746,
      address: zeroAddress,
      symbol: 'TG7T',
      name: 'TG7T',
      decimals: 18,
    },
    {
      chainId: 13746,
      address: '0x6b885d96916d18cd78e44b42c6489ca6f8794565',
      symbol: 'WTG7T',
      name: 'WTG7T',
      decimals: 18,
    },
  ],

  // Boss
  70701: [
    {
      chainId: 70701,
      address: zeroAddress,
      symbol: 'ETH',
      name: 'Ether',
      decimals: 18,
    },
    {
      chainId: 70701,
      address: '0x48a9b22b80f566e88f0f1dcc90ea15a8a3bae8a4',
      symbol: 'WETH',
      name: 'WETH',
      decimals: 18,
    },
  ],

  // Forma
  984122: [
    {
      chainId: 984122,
      address: zeroAddress,
      symbol: 'TIA',
      name: 'TIA',
      decimals: 18,
    },
    {
      chainId: 984122,
      address: '0xd5eace1274dbf70960714f513db207433615a263',
      symbol: 'WTIA',
      name: 'WTIA',
      decimals: 18,
    },
  ],

  // Forma Sketchpad
  984123: [
    {
      chainId: 984123,
      address: zeroAddress,
      symbol: 'TIA',
      name: 'TIA',
      decimals: 18,
    },
    {
      chainId: 984123,
      address: '0xd5eace1274dbf70960714f513db207433615a263',
      symbol: 'WTIA',
      name: 'WTIA',
      decimals: 18,
    },
  ],

  // B3
  8333: [
    {
      chainId: 8333,
      address: zeroAddress,
      symbol: 'ETH',
      name: 'ETH',
      decimals: 18,
    },
    {
      chainId: 8333,
      address: '0x4200000000000000000000000000000000000006',
      symbol: 'WETH',
      name: 'WETH',
      decimals: 18,
    },
  ],

  // Apechain
  33139: [
    {
      chainId: 33139,
      address: zeroAddress,
      symbol: 'APE',
      name: 'APE',
      decimals: 18,
    },
    {
      chainId: 33139,
      address: '0x48b62137edfa95a428d35c09e44256a739f6b557',
      symbol: 'WAPE',
      name: 'WAPE',
      decimals: 18,
    },
  ],

  // Curtis
  33111: [
    {
      chainId: 33111,
      address: zeroAddress,
      symbol: 'APE',
      name: 'APE',
      decimals: 18,
    },
    {
      chainId: 33111,
      address: '0x8643a49363e80c7a15790703b915d1b0b6b71d56',
      symbol: 'WAPE',
      name: 'WAPE',
      decimals: 18,
    },
  ],

  // Shape
  360: [
    {
      chainId: 360,
      address: zeroAddress,
      symbol: 'ETH',
      name: 'ETH',
      decimals: 18,
    },
    {
      chainId: 360,
      address: '0x4200000000000000000000000000000000000006',
      symbol: 'WETH',
      name: 'WETH',
      decimals: 18,
    },
  ],

  // Shape Sepolia
  11011: [
    {
      chainId: 11011,
      address: zeroAddress,
      symbol: 'ETH',
      name: 'ETH',
      decimals: 18,
    },
    {
      chainId: 11011,
      address: '0x48a9b22b80f566e88f0f1dcc90ea15a8a3bae8a4',
      symbol: 'WETH',
      name: 'WETH',
      decimals: 18,
    },
  ],

  // Abstract Testnet
  11124: [
    {
      chainId: 11124,
      address: zeroAddress,
      symbol: 'ETH',
      name: 'ETH',
      decimals: 18,
    },
    {
      chainId: 11124,
      address: '0x9edcde0257f2386ce177c3a7fcdd97787f0d841d',
      symbol: 'WETH',
      name: 'WETH',
      decimals: 18,
    },
  ],

  // Minato
  1946: [
    {
      chainId: 1946,
      address: zeroAddress,
      symbol: 'ETH',
      name: 'ETH',
      decimals: 18,
    },
    {
      chainId: 1946,
      address: '0x4200000000000000000000000000000000000006',
      symbol: 'WETH',
      name: 'WETH',
      decimals: 18,
    },
  ],

  // Hychain
  2911: [
    {
      chainId: 2911,
      address: zeroAddress,
      symbol: 'TOPIA',
      name: 'Hychain',
      decimals: 18,
    },
    {
      chainId: 2911,
      address: '0x2b1499d631bffb29eed7749b12cba754273d6da7',
      symbol: 'WTOPIA',
      name: 'Wrapped TOPIA',
      decimals: 18,
    },
  ],

  // Hychain Testnet
  29112: [
    {
      chainId: 29112,
      address: zeroAddress,
      symbol: 'TOPIA',
      name: 'Hychain',
      decimals: 18,
    },
    {
      chainId: 29112,
      address: '0x2549584be33491340eee6762992055cda05b2581',
      symbol: 'WTOPIA',
      name: 'Wrapped TOPIA',
      decimals: 18,
    },
  ],

  // Flow
  747: [
    {
      chainId: 747,
      address: zeroAddress,
      symbol: 'FLOW',
      name: 'Flow',
      decimals: 18,
    },
    {
      chainId: 747,
      address: '0xd3bf53dac106a0290b0483ecbc89d40fcc961f3e',
      symbol: 'WFLOW',
      name: 'WFLOW',
      decimals: 18,
    },
  ],

  // Zero
  543210: [
    {
      chainId: 543210,
      address: zeroAddress,
      symbol: 'ETH',
      name: 'ETH',
      decimals: 18,
    },
    {
      chainId: 543210,
      address: '0xac98b49576b1c892ba6bfae08fe1bb0d80cf599c',
      symbol: 'WETH',
      name: 'WETH',
      decimals: 18,
    },
  ],

  // Zero Testnet
  43210: [
    {
      chainId: 43210,
      address: zeroAddress,
      symbol: 'ETH',
      name: 'ETH',
      decimals: 18,
    },
    {
      chainId: 43210,
      address: '0xee6b04fcd07a54d78a7a23f353f2b4a0bfb4a78c',
      symbol: 'WETH',
      name: 'WETH',
      decimals: 18,
    },
  ],

  // Abstract
  2741: [
    {
      chainId: 2741,
      address: zeroAddress,
      symbol: 'ETH',
      name: 'ETH',
      decimals: 18,
    },
    {
      chainId: 2741,
      address: '0x3439153eb7af838ad19d56e1571fbd09333c2809',
      symbol: 'WETH',
      name: 'WETH',
      decimals: 18,
    },
  ],

  // Anime Testnet
  6900: [
    {
      chainId: 6900,
      address: zeroAddress,
      symbol: 'ANIME',
      name: 'ANIME',
      decimals: 18,
    },
    {
      chainId: 6900,
      address: '0x164906a76f1a2ea933366c446ae0ec6a37062c42',
      symbol: 'WANIME',
      name: 'WANIME',
      decimals: 18,
    },
  ],

  // Monad Devnet
  41454: [
    {
      chainId: 41454,
      address: zeroAddress,
      symbol: 'MON',
      name: 'MON',
      decimals: 18,
    },
    {
      chainId: 41454,
      address: '0x3c6dd29e612b28c10f3ee9bacf0f4af5f17b3f3e',
      symbol: 'WMON',
      name: 'WMON',
      decimals: 18,
    },
  ],

  //game7
  2187: [
    {
      chainId: 2187,
      address: zeroAddress,
      symbol: 'G7',
      name: 'Game7',
      decimals: 18,
    },
    {
      chainId: 2187,
      address: '0xfa3ed70386b9255fC04aA008A8ad1B0CDa816Fac',
      symbol: 'Wrapped Game7',
      name: 'WG7',
      decimals: 18,
    },
  ],

  // Creator Testnet
  4654: [
    {
      chainId: 4654,
      address: zeroAddress,
      symbol: 'ETH',
      name: 'Creator Testnet ETH',
      decimals: 18,
    },
    {
      chainId: 4654,
      address: '0x34AF38Ec07708dBC01C5A814fc418D3840448fce',
      symbol: 'WETH',
      name: 'WETH',
      decimals: 18,
    },
  ],

  // Story Odyssey
  1516: [
    {
      chainId: 1516,
      address: zeroAddress,
      symbol: 'IP',
      name: 'IP',
      decimals: 18,
    },
    {
      chainId: 1516,
      address: '0x1516000000000000000000000000000000000000',
      symbol: 'WIP',
      name: 'WIP',
      decimals: 18,
    },
  ],

  // Monad Testnet
  10143: [
    {
      chainId: 10143,
      address: zeroAddress,
      symbol: 'MON',
      name: 'Monad',
      decimals: 18,
    },
    {
      chainId: 10143,
      address: '0x760afe86e5de5fa0ee542fc7b7b713e1c5425701',
      symbol: 'WMON',
      name: 'Wrapped Monad',
      decimals: 18,
    },
  ],

  // Ink
  57073: [
    {
      chainId: 57073,
      address: zeroAddress,
      symbol: 'ETH',
      name: 'ETH',
      decimals: 18,
    },
    {
      chainId: 57073,
      address: '0x4200000000000000000000000000000000000006',
      symbol: 'WETH',
      name: 'WETH',
      decimals: 18,
    },
  ],

  // Berachain
  80094: [
    {
      chainId: 80094,
      address: zeroAddress,
      symbol: 'BERA',
      name: 'BERA',
      decimals: 18,
    },
    {
      chainId: 80094,
      address: '0x6969696969696969696969696969696969696969',
      symbol: 'WBERA',
      name: 'WBERA',
      decimals: 18,
    },
  ],

  // Anime
  69000: [
    {
      chainId: 69000,
      address: zeroAddress,
      symbol: 'ANIME',
      name: 'ANIME',
      decimals: 18,
    },
    {
      chainId: 69000,
      address: '0x164906a76f1a2ea933366c446ae0ec6a37062c42',
      symbol: 'WANIME',
      name: 'WANIME',
      decimals: 18,
    },
  ],
} as Record<number, PaymentToken[]>
