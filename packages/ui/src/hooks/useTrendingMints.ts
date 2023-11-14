import { paths, setParams } from '@reservoir0x/reservoir-sdk'
import useSWR, { SWRConfiguration } from 'swr'
import { useReservoirClient } from './'

type TrendingMintsResponse =
  paths['/collections/trending-mints/v1']['get']['responses']['200']['schema']

type TrendingMintsQuery =
  paths['/collections/trending-mints/v1']['get']['parameters']['query']

export default function (
  options: TrendingMintsQuery | false,
  chainId?: number,
  swrOptions: SWRConfiguration = {}
) {
  const client = useReservoirClient()
  const chain =
    chainId !== undefined
      ? client?.chains.find((chain) => chain.id === chainId)
      : client?.currentChain()

  const url = new URL(`${chain?.baseApiUrl}/collections/trending-mints/v1`)
  let query: TrendingMintsQuery = { ...options }

  setParams(url, query)

  const { data, mutate, error, isValidating } = useSWR<TrendingMintsResponse>(
    url && options ? [url.href, client?.apiKey, client?.version] : null,
    null,
    {
      revalidateOnMount: true,
      ...swrOptions,
    }
  )

  const mints: TrendingMintsResponse['mints'] | null =
    data && data.mints ? data.mints : null
  return { response: data, data: mints, mutate, error, isValidating }
}
