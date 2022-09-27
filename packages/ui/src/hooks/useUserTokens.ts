import { paths, setParams } from '@reservoir0x/reservoir-kit-client'
import { useReservoirClient } from '@reservoir0x/reservoir-kit-ui'
import useSWRInfinite, { SWRInfiniteConfiguration } from 'swr/infinite'

type UserTokenResponse =
  paths['/users/{user}/tokens/v5']['get']['responses']['200']['schema']

type UserTokenQuery =
  paths['/users/{user}/tokens/v5']['get']['parameters']['query']

export default function (
  user?: string | undefined,
  options?: UserTokenQuery | false,
  swrOptions: SWRInfiniteConfiguration = {}
) {
  const client = useReservoirClient()

  const { data, mutate, error, isValidating, size, setSize } =
    useSWRInfinite<UserTokenResponse>(
      (pageIndex, previousPageData) => {
        // options are optional, no need to exit early if not provided
        if (!user) {
          return null
        }

        const url = new URL(`${client?.apiBase}/users/${user}/tokens/v4`)

        let query: UserTokenQuery = { ...options }

        if (previousPageData && previousPageData.tokens?.length === 0) {
          // there are no tokens in the previous page so exit b/c previous page was end
          return null
        } else if (previousPageData && pageIndex > 0) {
          query.offset = (query?.limit || 20) * pageIndex
        }

        // append query arguments to url
        setParams(url, query)

        // swr key
        return [url.href, client?.apiKey, client?.version]
      },
      null,
      {
        revalidateOnMount: true,
        revalidateFirstPage: false,
        ...swrOptions,
      }
    )

  // map and flatten with depth of 1
  const tokens = data?.flatMap((page) => page.tokens) ?? []
  const hasNextPage = Boolean(data?.[size - 1]?.tokens.length > 0)
  const isFetchingInitialData = !data && !error
  // it is fetching the first page without error or type of previous page is not undefined, we are still fetching
  const isFetchingPage =
    isFetchingInitialData ||
    (size > 0 && data && typeof data[size - 1] === undefined)
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
    mutate,
    error,
    isValidating,
  }
}
