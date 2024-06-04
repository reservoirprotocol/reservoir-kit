import { useAccount } from 'wagmi'
import { paths } from '@reservoir0x/reservoir-sdk'
import { SWRConfiguration } from 'swr'
import useUserListings from './useUserListings'

export default function (
  query?: paths['/users/{user}/asks/v1']['get']['parameters']['query'] | false,
  swrOptions?: SWRConfiguration,
  chainId?: number
) {
  const { address } = useAccount()
  return useUserListings(
    address,
    query ? query : undefined,
    swrOptions,
    address !== undefined,
    chainId
  )
}
