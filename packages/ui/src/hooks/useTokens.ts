import { paths, setParams } from '@reservoir0x/reservoir-kit-client'
import useReservoirClient from './useReservoirClient'
import useSWRInfinite, { SWRInfiniteConfiguration } from 'swr/infinite'
import { useContext } from 'react'
import { ProviderOptionsContext } from '../ReservoirKitProvider'

type TokenDetailsResponse =
  paths['/tokens/v5']['get']['responses']['200']['schema']

type TokensQuery = paths['/tokens/v5']['get']['parameters']['query']

export default function (
  options?: TokensQuery | false,
  swrOptions: SWRInfiniteConfiguration = {}
) {
  const client = useReservoirClient()
  const providerOptionsContext = useContext(ProviderOptionsContext)

  const { data, mutate, error, isValidating, size, setSize } =
    useSWRInfinite<TokenDetailsResponse>(
      (pageIndex, previousPageData) => {
        if (!options) {
          return null
        }

        const url = new URL(`${client?.apiBase}/tokens/v5`)
        let query: TokensQuery = { ...options }

        if (previousPageData && !previousPageData.continuation) {
          return null
        } else if (previousPageData && pageIndex > 0) {
          query.continuation = previousPageData.continuation
        }

        if (
          query.normalizeRoyalties === undefined &&
          providerOptionsContext.normalizeRoyalties !== undefined
        ) {
          query.normalizeRoyalties = providerOptionsContext.normalizeRoyalties
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

  const tokens = data?.flatMap((page) => page.tokens) ?? []
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
    data: tokens,
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
