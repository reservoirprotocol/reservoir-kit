import { Address, zeroAddress } from 'viem'

export type PaymentToken = {
  address: Address
  symbol: string
  decimals: number
  name?: string
  coinGeckoId?: string
}

export const chainPaymentTokensMap = {
  // @TODO: add rest of chains and payment tokens

  // Mainnet
  1: [
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
  // Goerli
  5: [
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
  ],
  // Polygon
  137: [
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
  ],
} as Record<number, PaymentToken[]>
