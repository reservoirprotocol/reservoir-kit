import useSWR from 'swr/immutable'
import { ReservoirChain, axios, paths } from '@reservoir0x/reservoir-sdk'
import { useMemo } from 'react'

type SolverCapacityResponse =
  paths['/execute/solve/capacity/v1']['post']['responses']['200']['schema'] & {
    fromChainId: number
  }

const fetcher = async (
  requests: {
    url: string
    fromChainId: number
  }[]
) => {
  const fetches = requests?.map(
    ({ url, fromChainId }) =>
      axios
        .post(url, { kind: 'cross-chain-intent', fromChainId: fromChainId })
        .then((res) => {
          return { ...res.data, fromChainId: fromChainId }
        })
        .catch(() => undefined) // If a fetch fails, return undefined
  )

  const results = await Promise.allSettled(fetches)
  return results.map((result) =>
    result.status === 'fulfilled' ? result.value : undefined
  )
}

export default function (
  fromChainIds: number[],
  chain?: ReservoirChain | null
) {
  const requests = fromChainIds.map((fromChainId) => {
    return {
      url: `${chain?.baseApiUrl}/execute/solve/capacity/v1`,
      fromChainId: fromChainId,
    }
  })

  const { data, error } = useSWR<SolverCapacityResponse[]>(
    requests?.length > 0 ? requests : undefined,
    fetcher,
    {
      refreshInterval: 300000, //5m
    }
  )

  // Transform the array of responses into a map with fromChainId as the key
  const solverCapacityChainIdMap = useMemo(() => {
    const map = new Map<number, SolverCapacityResponse>()
    data?.forEach((item) => {
      if (item) {
        map.set(item.fromChainId, item)
      }
    })
    return map
  }, [data])

  return {
    data: solverCapacityChainIdMap,
    isError: !!error,
    isLoading: !data && !error,
  }
}
