import { paths, setParams } from '@reservoir0x/reservoir-kit-client'
import useSWR, { SWRConfiguration } from 'swr'
import useReservoirClient from './useReservoirClient'

type CollectionResponse =
  paths['/collection/v3']['get']['responses']['200']['schema']

export default function (
  query?: paths['/collection/v3']['get']['parameters']['query'] | false,
  swrOptions: SWRConfiguration = {}
) {
  const client = useReservoirClient()

  const path = new URL(`${client?.apiBase}/collection/v3`)
  setParams(path, query || {})

  const { data, mutate, error, isValidating } = useSWR<CollectionResponse>(
    query ? [path.href, client?.apiKey] : null,
    null,
    {
      revalidateOnMount: true,
      ...swrOptions,
    }
  )
  const collection: CollectionResponse['collection'] | null =
    data && data.collection ? data.collection : null

  return { response: data, data: collection, mutate, error, isValidating }
}
