import { paths, setParams } from '@reservoir0x/reservoir-sdk'
import useReservoirClient from './useReservoirClient'
import useSWRInfinite, { SWRInfiniteConfiguration } from 'swr/infinite'

type UserCollections =
  paths['/users/{user}/collections/v2']['get']['responses']['200']['schema']
type UserCollectionsQuery =
  paths['/users/{user}/collections/v2']['get']['parameters']['query']

export default function (
  user?: string,
  options?: UserCollectionsQuery,
  swrOptions: SWRInfiniteConfiguration = {}
) {
  const client = useReservoirClient()

  const { data, mutate, error, isValidating, size, setSize } =
    useSWRInfinite<UserCollections>(
      (pageIndex, previousPageData) => {
        if (!user) {
          return null
        }
        const url = new URL(
          `${client?.apiBase || ''}/users/${user}/collections/v2`
        )
        let query: UserCollectionsQuery = 
        {
          offset: pageIndex * 20, 
          includeTopBid: true,
          limit: 20,
          ...options
        }

        if (previousPageData?.collections && previousPageData?.collections?.length === 0) {
          return null
        }

        setParams(url, query)
        return [url.href, client?.apiKey, client?.version]
      },
      null,
      {
        revalidateOnMount: true,
        revalidateFirstPage: false,
        ...swrOptions,
      }
    )

  const collections = data?.flatMap((page) => page.collections) ?? []
  const hasNextPage = Boolean(data?.[size - 1]?.collections?.length === 20)
  const isFetchingInitialData = !data && !error
  const isFetchingPage =
    isFetchingInitialData ||
    (size > 0 && data && typeof data[size - 1] === 'undefined')
  const fetchNextPage = () => {
    if (!isFetchingPage && hasNextPage) {
      setSize((size) => size + 1)
    }
  }

  return {
    response: data,
    data: collections,
    hasNextPage,
    isFetchingInitialData,
    isFetchingPage,
    fetchNextPage,
    setSize,
    mutate,
    error,
    isValidating,
  }
}
