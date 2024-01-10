import { paths } from '@reservoir0x/reservoir-sdk'
import useSWR from 'swr/immutable'
import { useReservoirClient } from './'

type MarketplaceConfigurationsResponse =
  paths['/collections/{collection}/marketplace-configurations/v1']['get']['responses']['200']['schema']

export default function (
  collectionId: string,
  chainId?: number,
  enabled: boolean = true
) {
  const client = useReservoirClient()
  const chain =
    chainId !== undefined
      ? client?.chains.find((chain) => chain.id === chainId)
      : client?.currentChain()

  const { data, error } = useSWR<MarketplaceConfigurationsResponse[]>(
    enabled
      ? `${chain?.baseApiUrl}/collections/${collectionId}/marketplace-configurations/v1`
      : null
  )

  return {
    data: data,
    isError: !!error,
    isLoading: !data && !error,
  }
}
