import { paths, setParams } from '@reservoir0x/reservoir-sdk'
import useSWR, { SWRConfiguration } from 'swr'
import { useReservoirClient } from './'

type TrendingCollectionsResponse =
  paths['/collections/v1']['get']['responses']['200']['schema']

type TrendingCollectionsQuery =
  paths['/collections/v1']['get']['parameters']['query']

export default function (
  options: TrendingCollectionsQuery | false,
  chainId?: number,
  swrOptions: SWRConfiguration = {}
) {
  const client = useReservoirClient()
  const chain =
    chainId !== undefined
      ? client?.chains.find((chain) => chain.id === chainId)
      : client?.currentChain()

  const url = new URL(`${chain?.baseApiUrl}/collections/v1`)
  let query: TrendingCollectionsQuery = { ...options }

  setParams(url, query)

  const { data, mutate, error, isValidating } =
    useSWR<TrendingCollectionsResponse>(
      url && options ? [url.href, client?.apiKey, client?.version] : null,
      null,
      {
        revalidateOnMount: true,
        ...swrOptions,
      }
    )

  const collections: TrendingCollectionsResponse['collections'] | null =
    data && data.collections ? data.collections : null
  return { response: data, data: collections, mutate, error, isValidating }
}
