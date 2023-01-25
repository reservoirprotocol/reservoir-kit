import { paths, setParams } from '@reservoir0x/reservoir-sdk'
import { SWRInfiniteConfiguration } from 'swr/infinite'
import useSWR from 'swr'
import { useInfiniteApi, useReservoirClient } from './'
import { useEffect } from 'react'

type TokenDetailsResponse =
  paths['/tokens/v5']['get']['responses']['200']['schema']

type TokensQuery = paths['/tokens/v5']['get']['parameters']['query']

type TokenEventsResponse =
  paths['/events/tokens/floor-ask/v3']['get']['responses']['200']['schema']

type TokenEventsQuery =
  paths['/events/tokens/floor-ask/v3']['get']['parameters']['query']

type TokenDetailsFloorAsk = NonNullable<NonNullable<paths['/tokens/v5']['get']['responses']['200']['schema']['tokens']>[0]['market']>['floorAsk']

type TokenEventsFloorAsk = NonNullable<paths['/events/tokens/floor-ask/v3']['get']['responses']['200']['schema']['events']>[0]['floorAsk']


export default function (
  options?: TokensQuery | false,
  swrOptions: SWRInfiniteConfiguration = {},
  realtime?: boolean
) {
  const client = useReservoirClient()

  const response = useInfiniteApi<TokenDetailsResponse>(
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

  const tokens = response.data?.flatMap((page) => page.tokens) ?? []

  // If Realtime is enabled, every time the best price of a token changes (i.e. the 'floor ask'), an
  // event is generated and the data is updated
  if(realtime && options) {
    const path = new URL(`${client?.apiBase}/events/tokens/floor-ask/v3`)

    const query: TokenEventsQuery = {contract: options?.collection}
    setParams(path, query)

    const { data: eventData } = useSWR<TokenEventsResponse>(
      path ? [path.href, client?.apiKey, client?.version] : null,
      null,
      { refreshInterval: 1000 }
    )

    // const updatedTokens = 
    //  tokens.filter((token) => {
    //   eventData.events?.includes(token?.token?.tokenId)
    //  })
      

    useEffect(() => {
        response.mutate(undefined, 
        {
          rollbackOnError: true,
          populateCache: true,
          revalidate: false
        }
    )
    }, [eventData])
  }

  return {
    ...response,
    data: tokens,
  }
}

