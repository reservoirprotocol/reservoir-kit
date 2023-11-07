import { customChains, reservoirChains } from '@reservoir0x/reservoir-sdk'

export default [
  {
    ...reservoirChains.mainnet,
  },
  {
    ...reservoirChains.goerli,
    paymentTokens: [
      ...reservoirChains.goerli.paymentTokens,
      {
        address: '0x68B7E050E6e2C7eFE11439045c9d49813C1724B8',
        symbol: 'phUSDC',
        name: 'phUSDC',
        decimals: 6,
        coinGeckoId: 'usd-coin',
      },
      {
        address: '0x11fE4B6AE13d2a6055C8D9cF65c55bac32B5d844',
        symbol: 'DAI',
        name: 'Dai',
        decimals: 18,
        coinGeckoId: 'dai',
      },
    ],
  },
  {
    ...reservoirChains.sepolia,
  },
  {
    ...reservoirChains.polygon,
  },
  {
    ...reservoirChains.optimism,
  },
  {
    ...reservoirChains.arbitrum,
  },
  {
    ...reservoirChains.zora,
  },
  {
    ...reservoirChains.base,
  },
  {
    ...reservoirChains.linea,
  },
  {
    ...reservoirChains.arbitrumNova,
  },
  {
    ...reservoirChains.ancient8Testnet,
    id: customChains.ancient8Testnet.id,
  },
  {
    ...reservoirChains.scroll,
  },
]
