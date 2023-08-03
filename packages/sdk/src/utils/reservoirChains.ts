import { zeroAddress } from 'viem'
import { ReservoirChain } from '../actions'

type ReservoirBaseChain = Omit<ReservoirChain, 'active'>;

export const mainnet = {
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

export const goerli = {
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

export const polygon = {
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

export const optimism = {
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

export const arbitrum = {
  id: 10,
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
