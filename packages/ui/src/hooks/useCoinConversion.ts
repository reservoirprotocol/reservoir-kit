import { useContext } from 'react'
import useSWR from 'swr'
import { CoinGecko, ProviderOptionsContext } from '../ReservoirKitProvider'

const createBaseUrl = (config: CoinGecko | undefined) => {
  if (config?.proxy) return `${config.proxy}?`

  if (config?.apiKey)
    return `https://pro-api.coingecko.com/api/v3/coins/markets?x_cg_pro_api_key={${config.apiKey}}&`

  return 'https://api.coingecko.com/api/v3/coins/markets?'
}

export default function (
  vs_currency?: string,
  symbols: string = 'eth',
  id: string = ''
): { price: number; symbol: string; id: string }[] {
  const providerOptionsContext = useContext(ProviderOptionsContext)

  const baseUrl = createBaseUrl(providerOptionsContext?.coinGecko)

  if (symbols.includes(',')) {
    id = symbols
      .split(',')
      .map((id) => providerOptionsContext.coinGecko?.coinIds?.[id])
      .join(',')
  } else {
    id = id ? id : providerOptionsContext.coinGecko?.coinIds?.[symbols] || ''
  }

  const { data } = useSWR(
    vs_currency
      ? `${baseUrl}vs_currency=${vs_currency}&symbols=${symbols}&ids=${id}`
      : null,
    null,
    {
      refreshInterval: 60 * 1000 * 5, //5m Interval
    }
  )

  if (data && data.length > 0) {
    return data.map((conversion: any) => ({
      price: conversion.current_price,
      symbol: (conversion.symbol || '').toUpperCase(),
      coinGeckoId: conversion.id,
    }))
  }
  return []
}
