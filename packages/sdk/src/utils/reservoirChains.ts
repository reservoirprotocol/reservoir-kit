import { zeroAddress } from 'viem'
import { ReservoirChain } from '../actions'

type ReservoirBaseChain = Omit<ReservoirChain, 'active'>;

const mainnet = {
  id: 1,
  baseApiUrl: 'https://api.reservoir.tools',
  paymentTokens: [
    {
      address: zeroAddress,
      symbol: 'ETH',
      name: 'ETH',
      decimals: 18,
      coinGeckoId: 'ethereum',
    },
    {
      address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      symbol: 'USDC',
      name: 'USDC',
      decimals: 6,
      coinGeckoId: 'usd-coin',
    },
    {
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      symbol: 'WETH',
      name: 'WETH',
      decimals: 18,
      coinGeckoId: 'weth',
    },
  ],
} satisfies ReservoirBaseChain

const goerli = {
  id: 5,
  baseApiUrl: 'https://api-goerli.reservoir.tools',
  paymentTokens: [
    {
      address: zeroAddress,
      symbol: 'ETH',
      name: 'ETH',
      decimals: 18,
      coinGeckoId: 'ethereum',
    },
    {
      address: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
      symbol: 'WETH',
      name: 'WETH',
      decimals: 18,
      coinGeckoId: 'weth',
    },
    {
      address: '0x07865c6e87b9f70255377e024ace6630c1eaa37f',
      symbol: 'USDC',
      name: 'USDC',
      decimals: 6,
      coinGeckoId: 'usd-coin',
    },
  ],
} satisfies ReservoirBaseChain

const polygon = {
  id: 137,
  baseApiUrl: 'https://api-polygon.reservoir.tools',
  paymentTokens: [
    {
      address: zeroAddress,
      symbol: 'MATIC',
      name: 'MATIC',
      decimals: 18,
      coinGeckoId: 'matic-network',
    },
    {
      address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
      symbol: 'WETH',
      name: 'WETH',
      decimals: 18,
      coinGeckoId: 'weth',
    },
    {
      address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      symbol: 'USDC',
      name: 'USDC',
      decimals: 6,
      coinGeckoId: 'usd-coin',
    },
  ],
} satisfies ReservoirBaseChain

const mumbai = {
  id: 80001,
  baseApiUrl: 'https://api-mumbai.reservoir.tools',
  paymentTokens: [
    {
      address: zeroAddress,
      symbol: 'MATIC',
      name: 'MATIC',
      decimals: 18,
      coinGeckoId: 'matic-network',
    },
    {
      address: '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889',
      symbol: 'WMATIC',
      name: 'WMATIC',
      decimals: 18,
      coinGeckoId: 'wmatic',
    },
  ],
} satisfies ReservoirBaseChain

const optimism = {
  id: 10,
  baseApiUrl: 'https://api-optimism.reservoir.tools',
  paymentTokens: [
    {
      address: zeroAddress,
      symbol: 'ETH',
      name: 'ETH',
      decimals: 18,
      coinGeckoId: 'optimism',
    },
    {
      address: '0x4200000000000000000000000000000000000006',
      symbol: 'WETH',
      name: 'WETH',
      decimals: 18,
      coinGeckoId: 'weth',
    },
    {
      address: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
      symbol: 'USDC',
      name: 'USDC',
      decimals: 6,
      coinGeckoId: 'usd-coin',
    },
  ],
} satisfies ReservoirBaseChain

const arbitrum = {
  id: 42161,
  baseApiUrl: 'https://api-arbitrum.reservoir.tools',
  paymentTokens: [
    {
      address: zeroAddress,
      symbol: 'ETH',
      name: 'ETH',
      decimals: 18,
      coinGeckoId: 'arbitrum',
    },
    {
      address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
      symbol: 'WETH',
      name: 'WETH',
      decimals: 18,
      coinGeckoId: 'weth',
    },
    {
      address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
      symbol: 'USDC',
      name: 'USDC',
      decimals: 6,
      coinGeckoId: 'usd-coin',
    },
  ],
} satisfies ReservoirBaseChain

const arbitrumNova = {
  id: 42170,
  baseApiUrl: 'https://api-arbitrum-nova.reservoir.tools',
  paymentTokens: [
    {
      address: zeroAddress,
      symbol: 'ETH',
      name: 'ETH',
      decimals: 18,
      coinGeckoId: 'ethereum',
    },
    {
      address: '0x722e8bdd2ce80a4422e880164f2079488e115365',
      symbol: 'WETH',
      name: 'WETH',
      decimals: 18,
      coinGeckoId: 'weth',
    },
  ],
} satisfies ReservoirBaseChain

const sepolia = {
  id: 11155111,
  baseApiUrl: 'https://api-sepolia.reservoir.tools',
  paymentTokens: [
    {
      address: zeroAddress,
      symbol: 'ETH',
      name: 'ETH',
      decimals: 18,
      coinGeckoId: 'ethereum',
    },
    {
      address: '0x7b79995e5f793a07bc00c21412e50ecae098e7f9',
      symbol: 'WETH',
      name: 'WETH',
      decimals: 18,
      coinGeckoId: 'weth',
    },
  ],
} satisfies ReservoirBaseChain

const base = {
  id: 8453,
  baseApiUrl: 'https://api-base.reservoir.tools',
  paymentTokens: [
    {
      address: zeroAddress,
      symbol: 'ETH',
      name: 'ETH',
      decimals: 18,
      coinGeckoId: 'ethereum',
    },
    {
      address: '0x4200000000000000000000000000000000000006',
      symbol: 'WETH',
      name: 'WETH',
      decimals: 18,
      coinGeckoId: 'weth',
    },
  ],
} satisfies ReservoirBaseChain

const baseGoerli = {
  id: 84531,
  baseApiUrl: 'https://api-base-goerli.reservoir.tools',
  paymentTokens: [
    {
      address: zeroAddress,
      symbol: 'ETH',
      name: 'ETH',
      decimals: 18,
      coinGeckoId: 'ethereum',
    },
    {
      address: '0x4200000000000000000000000000000000000006',
      symbol: 'WETH',
      name: 'WETH',
      decimals: 18,
      coinGeckoId: 'weth',
    },
  ],
} satisfies ReservoirBaseChain

const scrollTestnet = {
  id: 534353,
  baseApiUrl: 'https://api-scroll-alpha.reservoir.tools',
  paymentTokens: [
    {
      address: zeroAddress,
      symbol: 'ETH',
      name: 'ETH',
      decimals: 18,
      coinGeckoId: 'ethereum',
    },
    {
      address: '0xa1EA0B2354F5A344110af2b6AD68e75545009a03',
      symbol: 'WETH',
      name: 'WETH',
      decimals: 18,
      coinGeckoId: 'weth',
    },
  ],
} satisfies ReservoirBaseChain

const linea = {
  id: 59144,
  baseApiUrl: 'https://api-linea.reservoir.tools',
  paymentTokens: [
    {
      address: zeroAddress,
      symbol: 'ETH',
      name: 'ETH',
      decimals: 18,
      coinGeckoId: 'ethereum',
    },
    {
      address: '0xe5d7c2a44ffddf6b295a15c148167daaaf5cf34f',
      symbol: 'WETH',
      name: 'WETH',
      decimals: 18,
      coinGeckoId: 'weth',
    },
  ],
} satisfies ReservoirBaseChain

const bsc = {
  id: 56,
  baseApiUrl: 'https://api-bsc.reservoir.tools',
  paymentTokens: [
    {
      address: zeroAddress,
      symbol: 'ETH',
      name: 'ETH',
      decimals: 18,
      coinGeckoId: 'binancecoin',
    },
    {
      address: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
      symbol: 'WBNB',
      name: 'WBNB',
      decimals: 18,
      coinGeckoId: 'wbnb',
    },
  ],
} satisfies ReservoirBaseChain

const zora = {
  id: 7777777,
  baseApiUrl: 'https://api-zora.reservoir.tools',
  paymentTokens: [
    {
      address: zeroAddress,
      symbol: 'ETH',
      name: 'ETH',
      decimals: 18,
      coinGeckoId: 'ethereum',
    },
    {
      address: '0x4200000000000000000000000000000000000006',
      symbol: 'WETH',
      name: 'WETH',
      decimals: 18,
      coinGeckoId: 'weth',
    },
  ],
} satisfies ReservoirBaseChain


const zoraTestnet = {
  id: 999,
  baseApiUrl: 'https://api-zora-testnet.reservoir.tools',
  paymentTokens: [
    {
      address: zeroAddress,
      symbol: 'ETH',
      name: 'ETH',
      decimals: 18,
      coinGeckoId: 'ethereum',
    },
    {
      address: '0x8a5027ea12f45a13deb6CB96A07913c6e192BE84',
      symbol: 'WETH',
      name: 'WETH',
      decimals: 18,
      coinGeckoId: 'weth',
    },
  ],
} satisfies ReservoirBaseChain

export const reservoirChains = { mainnet, goerli, polygon, mumbai, optimism, arbitrum, arbitrumNova, sepolia, base, baseGoerli, bsc, scrollTestnet, linea, zora, zoraTestnet }
