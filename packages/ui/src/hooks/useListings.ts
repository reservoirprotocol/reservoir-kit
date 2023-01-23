import { paths, setParams } from '@reservoir0x/reservoir-sdk'
import useReservoirClient from './useReservoirClient'
import { SWRInfiniteConfiguration } from 'swr/infinite'
import useInfiniteApi from './useInfiniteApi'

type Asks = paths['/orders/asks/v4']['get']['responses']['200']['schema']
type AsksQuery = paths['/orders/asks/v4']['get']['parameters']['query']

export default function (
  options: AsksQuery,
  swrOptions: SWRInfiniteConfiguration = {},
  enabled: boolean = true
) {
  const client = useReservoirClient()

  const response = useInfiniteApi<Asks>(
    (pageIndex, previousPageData) => {
      if (!enabled) {
        return null
      }

      const url = new URL(`${client?.apiBase || ''}/orders/asks/v4`)
      let query: AsksQuery = options || {}

      if (
        query.normalizeRoyalties === undefined &&
        client?.normalizeRoyalties !== undefined
      ) {
        query.normalizeRoyalties = client.normalizeRoyalties
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

  const listings = response.data?.flatMap((page) => page.orders) ?? []

  return {
    ...response,
    data: listings,
  }
}
