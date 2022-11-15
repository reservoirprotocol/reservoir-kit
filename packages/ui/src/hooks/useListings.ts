import { paths, setParams } from '@reservoir0x/reservoir-kit-client'
import useReservoirClient from './useReservoirClient'
import useSWRInfinite, { SWRInfiniteConfiguration } from 'swr/infinite'
import { useContext } from 'react'
import { ProviderOptionsContext } from '../ReservoirKitProvider'

type Asks = paths['/orders/asks/v3']['get']['responses']['200']['schema']
type AsksQuery = paths['/orders/asks/v3']['get']['parameters']['query']

export default function (
  options: AsksQuery,
  swrOptions: SWRInfiniteConfiguration = {}
) {
  const client = useReservoirClient()
  const providerOptionsContext = useContext(ProviderOptionsContext)

  const { data, mutate, error, isValidating, size, setSize } =
    useSWRInfinite<Asks>(
      (pageIndex, previousPageData) => {
        const url = new URL(`${client?.apiBase || ''}/orders/asks/v3`)
        let query: AsksQuery = options || {}

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

  const listings = data?.flatMap((page) => page.orders) ?? []
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
    data: listings,
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
