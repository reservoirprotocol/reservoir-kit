import useSWR from 'swr/immutable'
import { ReservoirChain, axios, paths } from '@reservoir0x/reservoir-sdk'

type SolverCapacityResponse =
  paths['/execute/solve/capacity/v1']['post']['responses']['200']['schema']

export default function (chain?: ReservoirChain | null) {
  const { data, error } = useSWR<SolverCapacityResponse>(
    chain ? `${chain?.baseApiUrl}/execute/solve/capacity/v1` : undefined,
    async (url) => {
      try {
        const response = await axios.post(url, {
          kind: 'cross-chain-intent',
        })
        return response.data
      } catch (error) {
        console.error('Error fetching solver capacity:', error)
        return undefined
      }
    },
    {
      refreshInterval: 300000, //5m
    }
  )

  return {
    data,
    isError: !!error,
    isLoading: !data && !error,
  }
}
