import { paths, setParams } from '@reservoir0x/reservoir-kit-client'
import useSWR, { SWRConfiguration } from 'swr'
import useReservoirClient from './useReservoirClient'
import { ProviderOptionsContext } from '../ReservoirKitProvider'
import { useContext } from 'react'

type CollectionResponse =
  paths['/collections/v5']['get']['responses']['200']['schema']

export default function (
  options?: paths['/collections/v5']['get']['parameters']['query'] | false,
  swrOptions: SWRConfiguration = {}
) {
  const client = useReservoirClient()
  const providerOptionsContext = useContext(ProviderOptionsContext)

  const path = new URL(`${client?.apiBase}/collections/v5`)
  const query = options || {}
  if (
    query.normalizeRoyalties === undefined &&
    providerOptionsContext.normalizeRoyalties !== undefined
  ) {
    query.normalizeRoyalties = providerOptionsContext.normalizeRoyalties
  }

  setParams(path, query)

  const { data, mutate, error, isValidating } = useSWR<CollectionResponse>(
    options ? [path.href, client?.apiKey, client?.version] : null,
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
