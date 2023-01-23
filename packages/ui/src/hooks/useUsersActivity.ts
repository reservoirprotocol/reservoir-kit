import { paths, setParams } from '@reservoir0x/reservoir-sdk'
import { useReservoirClient, useInfiniteApi } from './'
import { SWRInfiniteConfiguration } from 'swr/infinite'

type UsersActivityResponse =
  paths['/users/activity/v5']['get']['responses']['200']['schema']

type UsersActivityBaseQuery =
  paths['/users/activity/v5']['get']['parameters']['query']

type UsersQuery = UsersActivityBaseQuery['users'] | undefined
type UsersActivityQuery = Omit<UsersActivityBaseQuery, 'users'>

export default function (
  users?: UsersQuery,
  options?: UsersActivityQuery | false,
  swrOptions: SWRInfiniteConfiguration = {}
) {
  const client = useReservoirClient()

  const response = useInfiniteApi<UsersActivityResponse>(
    (pageIndex, previousPageData) => {
      if (!users) {
        return null
      }

      const url = new URL(`${client?.apiBase}/users/activity/v5`)

      let query: UsersActivityBaseQuery = { ...options, users }

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
