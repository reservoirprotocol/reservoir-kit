import { useContext } from 'react'
import useSWR from 'swr/immutable'
import { CoinGecko, ProviderOptionsContext } from '../ReservoirKitProvider'

const createBaseUrl = (config: CoinGecko | undefined) => {
  if (config?.proxy) return `${config.proxy}?`

  if (config?.apiKey)
    return `https://pro-api.coingecko.com/api/v3/coins/list?x_cg_pro_api_key={${config.apiKey}}`

  return 'https://api.coingecko.com/api/v3/coins/list'
}

type CoinList = Record<string, { name: string; symbol: string; id: string }[]>

export default function () {
  const providerOptionsContext = useContext(ProviderOptionsContext)
  const baseUrl = createBaseUrl(providerOptionsContext?.coinGecko)
  const response = useSWR(baseUrl, null, { refreshInterval: 7200000 })
  const coins: CoinList =
    response?.data?.reduce((coins: CoinList, coin: CoinList[0][0]) => {
      //Hardcoded symbol to id pairings for established cryptocurrencies
      if (
        (coin.symbol === 'eth' && coin.id !== 'ethereum') ||
        (coin.symbol === 'weth' && coin.id !== 'weth') ||
        (coin.symbol === 'wmatic' && coin.id !== 'wmatic') ||
        (coin.symbol === 'usdc' && coin.id !== 'usd-coin') ||
        (coin.symbol === 'matic' && coin.id !== 'matic-network') ||
        (coin.symbol === 'dai' && coin.id !== 'dai') ||
        (coin.symbol === 'sand' && coin.id !== 'the-sandbox')
      ) {
        return coins
      }
      if (!coins[coin.symbol]) {
        coins[coin.symbol] = [coin]
      } else {
        coins[coin.symbol].push(coin)
      }
      return coins
    }, {}) || {}

  return {
    ...response,
    data: coins,
  }
}
