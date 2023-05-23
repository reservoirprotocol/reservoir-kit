import { paths, setParams } from '@reservoir0x/reservoir-sdk'
import { SWRInfiniteConfiguration } from 'swr/infinite'
import { useInfiniteApi, useReservoirClient } from './'

type SearchActivitiesQuery =
  paths['/search/activities/v1']['get']['parameters']['query']

type SearchActivitiesResponse =
  paths['/search/activities/v1']['get']['responses']['200']['schema']

type SearchFilters = Pick<
  SearchActivitiesQuery,
  | 'attributes'
  | 'collection'
  | 'collectionsSetId'
  | 'community'
  | 'users'
  | 'contractsSetId'
>

type Search = {
  [K in keyof SearchFilters]: SearchFilters[K]
}

export default function (
  search: Search,
  options?: SearchActivitiesQuery,
  swrOptions: SWRInfiniteConfiguration = {},
  chaindId?: number
) {
  const client = useReservoirClient()

  const chain =
    chaindId !== undefined
      ? client?.chains.find((chain) => chain.id === chaindId)
      : client?.currentChain()

  const response = useInfiniteApi<SearchActivitiesResponse>(
    (pageIndex, previousPageData) => {
      if (Object.values(search).some((value) => !value)) {
        return null
      }

      const url = new URL(`${chain?.baseApiUrl}/search/activities/v1`)

      let query: SearchActivitiesQuery = { ...search, ...options }

      if (previousPageData && !previousPageData.continuation) {
        return null
      } else if (previousPageData && pageIndex > 0) {
        query.continuation = previousPageData.continuation
      }

      setParams(url, query)

      return [url.href, chain?.apiKey, client?.version]
    },
    {
      revalidateOnMount: true,
      revalidateFirstPage: false,
      ...swrOptions,
    }
  )

  const activities =
    response.data?.flatMap((page) => page.activities || []) ?? []

  return {
    ...response,
    data: activities,
  }
}
