import { paths, setParams } from '@reservoir0x/reservoir-kit-client'
import useReservoirClient from './useReservoirClient'
import useSWRInfinite, { SWRInfiniteConfiguration } from 'swr/infinite'

type UserTokenResponse =
  paths['/users/{user}/tokens/v6']['get']['responses']['200']['schema']

type UserTokenQuery =
  paths['/users/{user}/tokens/v6']['get']['parameters']['query']

export default function (
  user?: string | undefined,
  options?: UserTokenQuery | false,
  swrOptions: SWRInfiniteConfiguration = {}
) {
  const client = useReservoirClient()

  const { data, mutate, error, isValidating, size, setSize } =
    useSWRInfinite<UserTokenResponse>(
      (pageIndex, previousPageData) => {
        if (!user) {
          return null
        }

        const url = new URL(`${client?.apiBase}/users/${user}/tokens/v6`)

        let query: UserTokenQuery = { ...options }

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

  const tokens = data?.flatMap((page) => page.tokens) ?? []
  const isFetchingInitialData = !data && !error
  const isFetchingPage =
    isFetchingInitialData ||
    (size > 0 && data && typeof data[size - 1] === 'undefined')
  const hasNextPage = Boolean(data?.[size - 1]?.continuation)
  const fetchNextPage = () => {
    if (!isFetchingPage && hasNextPage) {
      setSize((size) => size + 1)
    }
  }

  return {
    response: data,
    data: tokens,
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
