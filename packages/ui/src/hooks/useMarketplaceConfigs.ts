import { ReservoirChain, paths } from '@reservoir0x/reservoir-sdk'
import useSWR from 'swr/immutable'

type MarketplaceConfigurationsResponse =
  paths['/collections/{collection}/marketplace-configurations/v1']['get']['responses']['200']['schema']

export default function (
  collectionId: string,
  chain?: ReservoirChain | null | undefined,
  enabled: boolean = true
) {
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
