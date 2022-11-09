import useListings from './useListings'
import { useAccount } from 'wagmi'
import { paths } from '@reservoir0x/reservoir-kit-client'
import { SWRConfiguration } from 'swr'

export default function (
  query?: paths['/orders/asks/v3']['get']['parameters']['query'] | false,
  swrOptions?: SWRConfiguration
) {
  const { address } = useAccount()
  let queryOptions = {
    maker: address,
  }
  if (query) {
    queryOptions = {
      ...queryOptions,
      ...query,
    }
  }
  return useListings(queryOptions, swrOptions)
}
