import { paths, setParams } from '@reservoir0x/reservoir-sdk'
import useReservoirClient from './useReservoirClient'
import { SWRInfiniteConfiguration } from 'swr/infinite'
import useInfiniteApi from './useInfiniteApi'

type Asks = paths['/orders/asks/v5']['get']['responses']['200']['schema']
type AsksQuery = paths['/orders/asks/v5']['get']['parameters']['query']

export default function (
  options: AsksQuery,
  swrOptions: SWRInfiniteConfiguration = {},
  enabled: boolean = true,
  chainId?: number
) {
  const client = useReservoirClient()
  const chain =
    chainId !== undefined
      ? client?.chains.find((chain) => chain.id === chainId)
      : client?.currentChain()

  const response = useInfiniteApi<Asks>(
    (pageIndex, previousPageData) => {
      if (!enabled) {
        return null
      }

      const url = new URL(`${chain?.baseApiUrl || ''}/orders/asks/v5`)
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
      return [url.href, chain?.apiKey, client?.version]
    },
    {
      revalidateOnMount: true,
      revalidateFirstPage: false,
      ...swrOptions,
    }
  )

  const listings = response.data?.flatMap((page) => page.orders || []) ?? []

  return {
    ...response,
    data: listings,
  }
}
