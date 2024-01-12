import useSWR from 'swr'
import { axios, paths } from '@reservoir0x/reservoir-sdk'
import { useReservoirClient } from './'

type SolverCapacityResponse =
  paths['/execute/solve/capacity/v1']['post']['responses']['200']['schema']

export default function (chainId?: number, enabled: boolean = true) {
  const client = useReservoirClient()
  const chain =
    chainId !== undefined
      ? client?.chains.find((chain) => chain.id === chainId)
      : client?.currentChain()

  const { data, error } = useSWR<SolverCapacityResponse>(
    chain && enabled ? `${chain?.baseApiUrl}/execute/solve/capacity/v1` : null,
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
      revalidateOnFocus: false,
    }
  )

  return {
    data,
    isError: !!error,
    isLoading: !data && !error,
  }
}
