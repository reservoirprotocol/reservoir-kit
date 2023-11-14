import useSWR from 'swr/immutable'
import { axios, paths } from '@reservoir0x/reservoir-sdk'
import { useReservoirClient } from '.'

type SolverCapacityResponse =
  paths['/execute/solve/capacity/v1']['post']['responses']['200']['schema']

const fetcher = async (requests) => {
  const fetches = requests.map(
    ({ url, fromChainId }) =>
      axios
        .post(url, { kind: 'cross-chain-intent', fromChainId: fromChainId })
        .then((res) => res.data)
        .catch(() => undefined) // If a fetch fails, return undefined
  )

  const results = await Promise.allSettled(fetches)
  return results.map((result) =>
    result.status === 'fulfilled' ? result.value : undefined
  )
}

export default function (chainIds: number[]) {
  const client = useReservoirClient()
  const requests = chainIds
    .map((chainId) => {
      const baseUrl = client?.chains.find(
        (chain) => chain?.id === chainId
      )?.baseApiUrl
      if (!baseUrl) return null
      return {
        url: `${baseUrl}/execute/solve/capacity/v1`,
        fromChainId: chainId,
      }
    })
    .filter(Boolean) // Filter out null values

  const { data, error } = useSWR<SolverCapacityResponse[]>(requests, fetcher, {
    dedupingInterval: 3600000, // 1 hour cache duration
  })

  return {
    data,
    isError: !!error,
    isLoading: !data && !error,
  }
}
