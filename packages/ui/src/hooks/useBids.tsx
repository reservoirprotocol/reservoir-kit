import { paths, setParams } from '@reservoir0x/reservoir-kit-client'
import useReservoirClient from './useReservoirClient'
import useSWRInfinite, { SWRInfiniteConfiguration } from 'swr/infinite'
import { ProviderOptionsContext } from '../ReservoirKitProvider'
import { useContext } from 'react'

type Bids = paths['/orders/bids/v4']['get']['responses']['200']['schema']
type BidsQuery = paths['/orders/bids/v4']['get']['parameters']['query']

export default function (
  options: BidsQuery,
  swrOptions: SWRInfiniteConfiguration = {},
  enabled: boolean = true
) {
  const client = useReservoirClient()
  const providerOptionsContext = useContext(ProviderOptionsContext)

  const { data, mutate, error, isValidating, size, setSize } =
    useSWRInfinite<Bids>(
      (pageIndex, previousPageData) => {
        if (!enabled) {
          return null
        }

        const url = new URL(`${client?.apiBase || ''}/orders/bids/v4`)
        let query = options || {}

        if (
          query.normalizeRoyalties === undefined &&
          providerOptionsContext.normalizeRoyalties !== undefined
        ) {
          query.normalizeRoyalties = providerOptionsContext.normalizeRoyalties
        }

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

  const bids = data?.flatMap((page) => page.orders) ?? []
  const hasNextPage = Boolean(data?.[size - 1]?.continuation)
  const isFetchingInitialData = !data && !error
  const isFetchingPage =
    isFetchingInitialData ||
    (size > 0 && data && typeof data[size - 1] === 'undefined')
  const fetchNextPage = () => {
    if (!isFetchingPage && hasNextPage) {
      setSize((size) => size + 1)
    }
  }

  return {
    response: data,
    data: bids,
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
