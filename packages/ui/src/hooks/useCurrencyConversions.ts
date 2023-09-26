import { ReservoirChain } from '@reservoir0x/reservoir-sdk'
import useSWR from 'swr'
import { PaymentToken } from '@reservoir0x/reservoir-sdk/src/utils/paymentTokens'

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
  prefferedCurrencyAddress: string,
  chain?: ReservoirChain | null | undefined,
  currencies?: PaymentToken[]
) {
  const urls = currencies?.map(
    (currency) =>
      `${chain?.baseApiUrl}/currencies/conversion/v1?from=${currency.address}&to=${prefferedCurrencyAddress}`
  )

  // @TODO: Add type
  const { data, error } = useSWR(urls, fetcher)
  return {
    data: data,
    isError: !!error,
    isLoading: !data && !error,
  }
}
