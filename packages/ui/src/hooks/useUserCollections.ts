import { paths, setParams } from '@reservoir0x/reservoir-sdk'
import { useReservoirClient, useInfiniteApi } from './'
import { SWRInfiniteConfiguration } from 'swr/infinite'

type UserCollections =
  paths['/users/{user}/collections/v4']['get']['responses']['200']['schema']
type UserCollectionsQuery =
  paths['/users/{user}/collections/v4']['get']['parameters']['query']

export default function (
  user?: string,
  options?: UserCollectionsQuery,
  swrOptions: SWRInfiniteConfiguration = {},
  chainId?: number
) {
  const client = useReservoirClient()
  const chain =
    chainId !== undefined
      ? client?.chains.find((chain) => chain.id === chainId)
      : client?.currentChain()

  let defaultLimit = 20

  const response = useInfiniteApi<UserCollections>(
    (pageIndex, previousPageData) => {
      if (!user) {
        return null
      }
      const url = new URL(
        `${chain?.baseApiUrl || ''}/users/${user}/collections/v4`
      )
      let query: UserCollectionsQuery = {
        offset: pageIndex * (options?.limit || defaultLimit),
        limit: options?.limit || defaultLimit,
        ...options,
      }

      if (
        previousPageData?.collections &&
        previousPageData?.collections?.length === 0
      ) {
        return null
      }

      setParams(url, query)
      return [url.href, client?.apiKey, client?.version]
    },
    {
      revalidateOnMount: true,
      revalidateFirstPage: false,
      ...swrOptions,
    },
    options?.limit || defaultLimit
  )

  const collections =
    response.data?.flatMap((page) => page.collections || []) ?? []

  return {
    ...response,
    data: collections,
  }
}
