import { paths, setParams } from '@reservoir0x/reservoir-kit-client'
import useReservoirClient from './useReservoirClient'
import useSWRInfinite, { SWRInfiniteConfiguration } from 'swr/infinite'

type Bids =
  paths['/orders/users/{user}/top-bids/v1']['get']['responses']['200']['schema']
type BidsQuery =
  paths['/orders/users/{user}/top-bids/v1']['get']['parameters']['query']

export default function (
  user?: string,
  options?: BidsQuery,
  swrOptions: SWRInfiniteConfiguration = {}
) {
  const client = useReservoirClient()

  const { data, mutate, error, isValidating, size, setSize } =
    useSWRInfinite<Bids>(
      (pageIndex, previousPageData) => {
        if (!user) {
          return null
        }
        const url = new URL(
          `${client?.apiBase || ''}/orders/users/${user}/top-bids/v1`
        )
        let query: BidsQuery = options || {}

        if (previousPageData && !previousPageData.continuation) {
          return null
        } else if (previousPageData && pageIndex > 0) {
          query.continuation = previousPageData.continuation
        }

        if (
          query.normalizeRoyalties === undefined &&
          client?.normalizeRoyalties !== undefined
        ) {
          query.normalizeRoyalties = client.normalizeRoyalties
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

  const bids = data?.flatMap((page) => page.topBids) ?? []
  const hasNextPage = Boolean(data?.[size - 1]?.continuation)
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
    data: bids,
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
