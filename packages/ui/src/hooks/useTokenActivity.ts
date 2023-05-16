import { paths, setParams } from '@reservoir0x/reservoir-sdk'
import { SWRInfiniteConfiguration } from 'swr/infinite'
import { useInfiniteApi, useReservoirClient } from './'

type TokenActivityQuery =
  paths['/tokens/{token}/activity/v4']['get']['parameters']['query']

type TokenActivityResponse =
  paths['/tokens/{token}/activity/v5']['get']['responses']['200']['schema']

export default function (
  token: string,
  options?: TokenActivityQuery | false,
  swrOptions: SWRInfiniteConfiguration = {},
  chainId?: number
) {
  const client = useReservoirClient()
  const chain =
    chainId !== undefined
      ? client?.chains.find((chain) => chain.id === chainId)
      : client?.currentChain()

  const response = useInfiniteApi<TokenActivityResponse>(
    (pageIndex, previousPageData) => {
      if (!token) {
        return null
      }

      const url = new URL(`${chain?.baseApiUrl}/tokens/${token}/activity/v5`)

      let query: TokenActivityQuery = { ...options }

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

  const activities =
    response.data?.flatMap((page) => page.activities || []) ?? []

  return {
    ...response,
    data: activities,
  }
}
