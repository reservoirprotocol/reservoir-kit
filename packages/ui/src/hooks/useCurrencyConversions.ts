import { ReservoirChain, paths } from '@reservoir0x/reservoir-sdk'
import useSWR from 'swr/immutable'
import { PaymentToken } from '@reservoir0x/reservoir-sdk'

type CurrencyConversionResponse =
  paths['/currencies/conversion/v1']['get']['responses']['200']['schema']

const fetcher = async (urls: string[]) => {
  const fetches = urls.map(
    (url) =>
      fetch(url)
        .then((r) => r.json())
        .catch(() => undefined) // If a fetch fails, return undefined
  )
  const results = await Promise.allSettled(fetches)
  return results.map((result) =>
    result.status === 'fulfilled' ? result.value : undefined
  )
}

export default function (
  prefferedCurrencyAddress?: string,
  chain?: ReservoirChain | null | undefined,
  currencies?: PaymentToken[]
) {
  const urls = prefferedCurrencyAddress
    ? currencies?.map(
        (currency) =>
          `${chain?.baseApiUrl}/currencies/conversion/v1?from=${currency.address}&to=${prefferedCurrencyAddress}`
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
