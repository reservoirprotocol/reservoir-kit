import useListings from './useListings'
import { useAccount } from 'wagmi'
import { paths } from '@reservoir0x/reservoir-sdk'
import { SWRConfiguration } from 'swr'

export default function (
  query?: paths['/orders/asks/v5']['get']['parameters']['query'] | false,
  swrOptions?: SWRConfiguration,
  chainId?: number
) {
  const { address } = useAccount()
  let queryOptions = {
    maker: address as string,
  }
  if (query) {
    queryOptions = {
      ...queryOptions,
      ...query,
    }
  }
  return useListings(queryOptions, swrOptions, address !== undefined, chainId)
}
