import { paths, setParams } from '@reservoir0x/reservoir-sdk'
import { SWRInfiniteConfiguration } from 'swr/infinite'
import { useInfiniteApi, useReservoirClient } from './'
import { useMemo } from 'react'
import { Address } from 'viem'

type Bids = paths['/users/{user}/bids/v1']['get']['responses']['200']['schema']
type BidsQuery = paths['/users/{user}/bids/v1']['get']['parameters']['query']

export default function (
  address?: Address,
  options?: BidsQuery,
  swrOptions: SWRInfiniteConfiguration = {},
  enabled: boolean = true,
  chainId?: number
) {
  const client = useReservoirClient()

  const response = useInfiniteApi<Bids>(
    (pageIndex, previousPageData) => {
      if (!enabled) {
        return null
      }

      const chain =
        chainId !== undefined
          ? client?.chains.find((chain) => chain.id === chainId)
          : client?.currentChain()

      const url = new URL(`${chain?.baseApiUrl || ''}/users/${address}/bids/v1`)
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

  const bids = useMemo(
    () => response.data?.flatMap((page) => page.orders || []) ?? [],
    [response.data]
  )

  return {
    ...response,
    data: bids,
  }
}
