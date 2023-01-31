import { paths, setParams } from '@reservoir0x/reservoir-sdk'
import { SWRInfiniteConfiguration } from 'swr/infinite'
import useSWR from 'swr'
import { useInfiniteApi, useReservoirClient } from './'
import { useEffect, useState } from 'react'

type TokenDetailsResponse =
  paths['/tokens/v5']['get']['responses']['200']['schema']

type TokensQuery = paths['/tokens/v5']['get']['parameters']['query']

type TokenEventsResponse =
  paths['/events/tokens/floor-ask/v3']['get']['responses']['200']['schema']

type TokenEventsQuery =
  paths['/events/tokens/floor-ask/v3']['get']['parameters']['query']

export default function (
  options?: TokensQuery | false,
  swrOptions: SWRInfiniteConfiguration = {},
  realtime?: boolean
) {
  const client = useReservoirClient()

  const tokenResponse = useInfiniteApi<TokenDetailsResponse>(
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

  const tokens = tokenResponse.data?.flatMap((page) => page.tokens) ?? []

  // If realtime is enabled, every time the best price of a token changes (i.e. the 'floor ask'), an
  // event is generated and the data is updated
  if (realtime && options && options.collection) {
    const path = new URL(`${client?.apiBase}/events/tokens/floor-ask/v3`)

    const query: TokenEventsQuery = { contract: options.collection }
    setParams(path, query)

    const { data: eventData } = useSWR<TokenEventsResponse>(
      path ? [path.href, client?.apiKey, client?.version] : null,
      null,
      { refreshInterval: 1000 }
    )

    // Sync token data with the event data
    let tokenData = tokenResponse.data

    const [realtimeTokens, setRealtimeTokens] = useState<
      NonNullable<TokenDetailsResponse['tokens']>
    >([])

    useEffect(() => {
      let updatedTokens =
        (tokenData
          ?.flatMap((page) => page.tokens)
          ?.map((token) => {
            let prevTokenFloorAsk = token?.market?.floorAsk
            const newTokenFloorAsk = eventData?.events?.find(
              (event) => event.token?.tokenId == token?.token?.tokenId
            )?.floorAsk

            if (prevTokenFloorAsk?.id == newTokenFloorAsk?.orderId) {
              return token
            } else if (token?.market && newTokenFloorAsk) {
              token.market.floorAsk = {
                ...prevTokenFloorAsk,
                id: newTokenFloorAsk?.orderId,
                maker: newTokenFloorAsk?.maker,
                price: newTokenFloorAsk?.price,
                validFrom: newTokenFloorAsk?.validFrom,
                validUntil: newTokenFloorAsk?.validUntil,
              }
            }

            return token
          }) as NonNullable<TokenDetailsResponse['tokens']>) ?? []

      // Sort tokens
      if (options.sortBy == 'floorAskPrice' || options.sortBy == undefined) {
        updatedTokens?.sort((a, b) => {
          let priceA = a?.market?.floorAsk?.price?.amount?.native
          let priceB = b?.market?.floorAsk?.price?.amount?.native

          if (!priceA || !priceB) {
            return 0
          } else if (
            options.sortDirection == 'asc' ||
            options.sortDirection == null
          ) {
            return priceA - priceB
          } else {
            return priceB - priceA
          }
        })
      }

      setRealtimeTokens(updatedTokens)

      if (!tokenResponse.isFetchingPage) {
        tokenResponse.mutate(tokenResponse.data, {
          optimisticData: tokenData,
          rollbackOnError: true,
          populateCache: true,
          revalidate: false,
        })
      }
    }, [eventData, tokenResponse.isFetchingPage])

    return {
      ...tokenResponse,
      data: realtimeTokens,
    }
  } else {
    return {
      ...tokenResponse,
      data: tokens,
    }
  }
}
