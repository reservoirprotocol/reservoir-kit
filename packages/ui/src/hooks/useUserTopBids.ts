import { paths, setParams } from '@reservoir0x/reservoir-sdk'
import { useReservoirClient, useInfiniteApi } from './'
import { SWRInfiniteConfiguration } from 'swr/infinite'

type Bids =
  paths['/orders/users/{user}/top-bids/v2']['get']['responses']['200']['schema']
type BidsQuery =
  paths['/orders/users/{user}/top-bids/v2']['get']['parameters']['query']

export default function (
  user?: string,
  options?: BidsQuery,
  swrOptions: SWRInfiniteConfiguration = {}
) {
  const client = useReservoirClient()

  const response = useInfiniteApi<Bids>(
    (pageIndex, previousPageData) => {
      if (!user) {
        return null
      }
      const url = new URL(
        `${client?.apiBase || ''}/orders/users/${user}/top-bids/v2`
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
    {
      revalidateOnMount: true,
      revalidateFirstPage: false,
      ...swrOptions,
    }
  )

  const bids = response.data?.flatMap((page) => page.topBids) ?? []

  return {
    ...response,
    data: bids,
  }
}
