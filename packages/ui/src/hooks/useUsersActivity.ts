import { paths, setParams } from '@reservoir0x/reservoir-kit-client'
import useReservoirClient from './useReservoirClient'
import useSWRInfinite, { SWRInfiniteConfiguration } from 'swr/infinite'

type UsersActivityResponse =
  paths['/users/activity/v4']['get']['responses']['200']['schema']

type UsersActivityBaseQuery =
  paths['/users/activity/v4']['get']['parameters']['query']

type UsersQuery = UsersActivityBaseQuery['users'] | undefined
type UsersActivityQuery = Omit<UsersActivityBaseQuery, 'users'>

export default function (
  users?: UsersQuery,
  options?: UsersActivityQuery | false,
  swrOptions: SWRInfiniteConfiguration = {}
) {
  const client = useReservoirClient()

  const { data, mutate, error, isValidating, size, setSize } =
    useSWRInfinite<UsersActivityResponse>(
      (pageIndex, previousPageData) => {
        if (!users) {
          return null
        }

        const url = new URL(`${client?.apiBase}/users/activity/v4`)

        let query: UsersActivityBaseQuery = { ...options, users }

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
