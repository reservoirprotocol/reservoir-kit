import { paths, setParams } from '@reservoir0x/reservoir-kit-client'
import useReservoirClient from './useReservoirClient'
import useSWRInfinite, { SWRInfiniteConfiguration } from 'swr/infinite'

type CollectionActivityResponse =
  paths['/collections/{collection}/activity/v3']['get']['responses']['200']['schema']

type CollectionActivityQuery =
  paths['/collections/{collection}/activity/v3']['get']['parameters']['query']

export default function (
  collection?: string | undefined,
  options?: CollectionActivityQuery | false,
  swrOptions: SWRInfiniteConfiguration = {}
) {
  const client = useReservoirClient()

  const { data, mutate, error, isValidating, size, setSize } =
    useSWRInfinite<CollectionActivityResponse>(
      (pageIndex, previousPageData) => {
        if (!collection) {
          return null
        }

        const url = new URL(
          `${client?.apiBase}/collections/${collection}/activity/v3`
        )

        let query: CollectionActivityQuery = { ...options }

        if (previousPageData && !previousPageData.continuation) {
          return null
        } else if (previousPageData && pageIndex > 0) {
          query.continuation = previousPageData.continuation
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

  const activities = data?.flatMap((page) => page.activities) ?? []
  const lastPageTokenCount = data?.[size - 1]?.activities?.length || 0
  const isFetchingInitialData = !data && !error
  const isFetchingPage =
    isFetchingInitialData ||
    (size > 0 && data && typeof data[size - 1] === 'undefined')
  const hasNextPage = lastPageTokenCount > 0 || isFetchingPage
  const fetchNextPage = () => {
    if (!isFetchingPage && hasNextPage) {
      setSize((size) => size + 1)
    }
  }

  return {
    response: data,
    data: activities,
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
