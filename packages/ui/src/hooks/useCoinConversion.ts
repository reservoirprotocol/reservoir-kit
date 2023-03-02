import useSWR from 'swr'

export default function (
  vs_currency?: string,
  symbols: string = 'eth',
  id: string = ''
) {
  const { data } = useSWR(
    vs_currency
      ? `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${vs_currency}&symbols=${symbols}&ids=${id}`
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
