import { paths, setParams } from '@reservoir0x/reservoir-sdk'
import { SWRInfiniteConfiguration } from 'swr/infinite'
import { useInfiniteApi, useReservoirClient } from './'

type Bids = paths['/orders/bids/v5']['get']['responses']['200']['schema']
type BidsQuery = paths['/orders/bids/v5']['get']['parameters']['query']

export default function (
  options: BidsQuery,
  swrOptions: SWRInfiniteConfiguration = {},
  enabled: boolean = true
) {
  const client = useReservoirClient()

  const response = useInfiniteApi<Bids>(
    (pageIndex, previousPageData) => {
      if (!enabled) {
        return null
      }

      const url = new URL(`${client?.apiBase || ''}/orders/bids/v5`)
      let query = options || {}

      if (
        query.normalizeRoyalties === undefined &&
        client?.normalizeRoyalties !== undefined
      ) {
        query.normalizeRoyalties = client?.normalizeRoyalties
      }

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

  const bids = response.data?.flatMap((page) => page.orders) ?? []

  return {
    ...response,
    data: bids,
  }
}
