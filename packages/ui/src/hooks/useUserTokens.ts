import { paths, setParams } from '@reservoir0x/reservoir-sdk'
import {useReservoirClient, useInfiniteApi} from './'
import { SWRInfiniteConfiguration } from 'swr/infinite'

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

  const response =
  useInfiniteApi<UserTokenResponse>(
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
      {
        revalidateOnMount: true,
        revalidateFirstPage: false,
        ...swrOptions,
      }
    )

  const tokens = response.data?.flatMap((page) => page.tokens) ?? []

  return {
...response,
    data: tokens,
  }
}
