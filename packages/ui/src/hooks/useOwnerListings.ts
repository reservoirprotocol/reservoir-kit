import useListings from './useListings'
import { useAccount } from 'wagmi'

export default function () {
  const { address } = useAccount()
  const listings = useListings({
    maker: address,
  })

  return listings
}
