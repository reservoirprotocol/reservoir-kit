import { paths, setParams } from '@reservoir0x/reservoir-kit-client'
import useSWR, { SWRConfiguration } from 'swr'
import useReservoirClient from './useReservoirClient'

type CollectionResponse =
  paths['/collections/v5']['get']['responses']['200']['schema']

export default function (
  query?: paths['/collections/v5']['get']['parameters']['query'] | false,
  swrOptions: SWRConfiguration = {}
) {
  const client = useReservoirClient()

  const path = new URL(`${client?.apiBase}/collections/v5`)
  setParams(path, query || {})

  const { data, mutate, error, isValidating } = useSWR<CollectionResponse>(
    query ? [path.href, client?.apiKey, client?.version] : null,
    null,
    {
      revalidateOnMount: true,
      ...swrOptions,
    }
  )
  const collections: CollectionResponse['collections'] | null =
    data && data.collections ? data.collections : null

  return { response: data, data: collections, mutate, error, isValidating }
}
