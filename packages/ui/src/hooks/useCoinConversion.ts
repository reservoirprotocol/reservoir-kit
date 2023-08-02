import { useContext } from 'react'
import useSWR from 'swr'
import { CoinGecko, ProviderOptionsContext } from '../ReservoirKitProvider'
import useCoinIds from './useCoinIds'

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
): { price: number; symbol: string }[] {
  const providerOptionsContext = useContext(ProviderOptionsContext)
  const { data: coinIds } = useCoinIds()
  const baseUrl = createBaseUrl(providerOptionsContext?.coinGecko)

  if (id.length === 0) {
    id = symbols
      .split(',')
      .reduce((ids: string[], symbol: string) => {
        const normalizedSymbol = symbol.toLowerCase()
        if (providerOptionsContext.coinGecko?.coinIds?.[normalizedSymbol]) {
          ids.push(providerOptionsContext.coinGecko.coinIds[normalizedSymbol])
        } else {
          const coins = coinIds[normalizedSymbol]
          if (coins?.length === 1) {
            ids.push(coins[0].id)
          }
        }

        return ids
      }, [])
      .join(',')
  }

  const { data } = useSWR(
    vs_currency ? `${baseUrl}vs_currency=${vs_currency}&ids=${id}` : null,
    null,
    {
      refreshInterval: 60 * 1000 * 5, //5m Interval
    }
  )

  if (data && data.length > 0) {
    return data
      .filter((conversion: any) =>
        symbols
          .split(',')
          .some((symbol) => symbol.toLowerCase().includes(conversion.symbol))
      )
      .map((conversion: any) => ({
        price: conversion.current_price,
        symbol: (conversion.symbol || '').toUpperCase(),
        coinGeckoId: conversion.id,
      }))
  }
  return []
}
