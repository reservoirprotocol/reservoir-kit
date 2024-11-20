import { axios, paths } from '@reservoir0x/reservoir-sdk'
import useSWR from 'swr/immutable'
import { PaymentToken } from '@reservoir0x/reservoir-sdk'
import { useReservoirClient } from '.'

type CurrencyConversionResponse =
  paths['/currencies/conversion/v1']['get']['responses']['200']['schema']

const fetcher = async (urls: string[]) => {
  const fetches = urls.map(
    (url) =>
      axios(url)
        .then((r) => r.data)
        .catch(() => undefined) // If a fetch fails, return undefined
  )
  const results = await Promise.allSettled(fetches)
  return results.map((result) =>
    result.status === 'fulfilled' ? result.value : undefined
  )
}

export default function (
  preferredCurrencyAddress?: string,
  currencies?: PaymentToken[]
) {
  const client = useReservoirClient()
  const urls = preferredCurrencyAddress
    ? currencies?.map(
        (currency) =>
          client?.chains.find((chain) => chain.id === currency.chainId)
            ?.baseApiUrl +
          `/currencies/conversion/v1?from=${currency.address}&to=${preferredCurrencyAddress}`
      )
    : undefined

  const { data, error } = useSWR<CurrencyConversionResponse[]>(urls, fetcher, {
    refreshInterval: 300000, //5m
  })
  return {
    data: data,
    isError: !!error,
    isLoading: !data && !error,
  }
}
