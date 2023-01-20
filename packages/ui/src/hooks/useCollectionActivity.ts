import { paths, setParams } from '@reservoir0x/reservoir-sdk'
import { SWRInfiniteConfiguration } from 'swr/infinite'
import { useInfiniteApi, useReservoirClient } from './'

type CollectionActivityResponse =
  paths['/collections/activity/v5']['get']['responses']['200']['schema']

type CollectionActivityQuery =
  paths['/collections/activity/v5']['get']['parameters']['query']

export default function (
  options?: CollectionActivityQuery | false,
  swrOptions: SWRInfiniteConfiguration = {}
) {
  const client = useReservoirClient()

  const response = useInfiniteApi<CollectionActivityResponse>(
    (pageIndex, previousPageData) => {
      if (
        !options ||
        (!options.collection && !options.collectionsSetId && !options.community)
      ) {
        return null
      }

      const url = new URL(`${client?.apiBase}/collections/activity/v5`)

      let query: CollectionActivityQuery = { ...options }

      if (previousPageData && !previousPageData.continuation) {
        return null
      } else if (previousPageData && pageIndex > 0) {
        query.continuation = previousPageData.continuation
      }

      setParams(url, query)

      return [url.href, client?.apiKey, client?.version]
    },
    {
      revalidateOnMount: true,
      revalidateFirstPage: false,
      ...swrOptions,
    }
  )

  const activities = response.data?.flatMap((page) => page.activities) ?? []

  return {
    ...response,
    data: activities,
  }
}
