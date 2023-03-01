import { useContext } from 'react'
import useSWR from 'swr'
import { CoinGecko, ProviderOptionsContext } from '../ReservoirKitProvider'

const createBaseUrl = (config: CoinGecko | undefined): string => {
  if (config?.apiKey)
    return `https://pro-api.coingecko.com/api/v3/coins/markets?x_cg_pro_api_key={${config.apiKey}}&`
  if (config?.proxyUrl) return `${config.proxyUrl}?`

  return `https://api.coingecko.com/api/v3/coins/markets?`
}

export default function (vs_currency?: string, symbols: string = 'eth') {
  const { coinGecko } = useContext(ProviderOptionsContext)

  const baseUrl = createBaseUrl(coinGecko)

  const { data } = useSWR(
    vs_currency
      ? `${baseUrl}vs_currency=${vs_currency}&symbols=${symbols}`
      : null,
    null,
    {
      refreshInterval: 60 * 1000 * 5, //5m Interval
    }
  )

  if (data && data[0] && data[0].current_price) {
    return data[0].current_price
  }
  return null
}
