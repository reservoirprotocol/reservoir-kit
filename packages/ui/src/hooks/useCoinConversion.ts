import useSWR from 'swr'

export default function (symbol?: string, ids: string = 'ethereum') {
  const { data } = useSWR(
    symbol
      ? `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${symbol}&ids=${ids}`
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
