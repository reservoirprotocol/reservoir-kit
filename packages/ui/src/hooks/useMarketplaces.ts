import { paths } from '@reservoir0x/reservoir-sdk'
import getLocalMarketplaceData from '../lib/getLocalMarketplaceData'
import { useEffect, useState } from 'react'
import useReservoirClient from './useReservoirClient'
import useSWRImmutable from 'swr/immutable'

export type Marketplace = NonNullable<
  paths['/admin/get-marketplaces']['get']['responses']['200']['schema']['marketplaces']
>[0] & {
  isSelected: boolean
  price: number | string
  truePrice: number | string
}

export default function (
  listingEnabledOnly?: boolean
): [Marketplace[], React.Dispatch<React.SetStateAction<Marketplace[]>>] {
  const [marketplaces, setMarketplaces] = useState<Marketplace[]>([])
  const client = useReservoirClient()
  const path = new URL(`${client?.apiBase}/admin/get-marketplaces`)

  const { data } = useSWRImmutable<
    paths['/admin/get-marketplaces']['get']['responses']['200']['schema']
  >([path.href, client?.apiKey, client?.version], null)

  useEffect(() => {
    if (data && data.marketplaces) {
      let updatedMarketplaces: Marketplace[] =
        data.marketplaces as Marketplace[]
      if (listingEnabledOnly) {
        updatedMarketplaces = updatedMarketplaces.filter(
          (marketplace) =>
            marketplace.listingEnabled && marketplace.orderbook !== 'x2y2'
        )
      }
      updatedMarketplaces.forEach((marketplace) => {
        if (marketplace.orderbook === 'reservoir') {
          const data = getLocalMarketplaceData()
          marketplace.name = data.title
          marketplace.feeBps = client?.marketplaceFee
            ? client.marketplaceFee
            : 0
          marketplace.fee = {
            bps: client?.marketplaceFee || 0,
            percent: (client?.marketplaceFee || 0) / 100,
          }
          if (data.icon) {
            marketplace.imageUrl = data.icon
          }
        }
        marketplace.price = 0
        marketplace.truePrice = 0
        marketplace.isSelected =
          marketplace.orderbook === 'reservoir' ? true : false
      })
      setMarketplaces(updatedMarketplaces)
    }
  }, [data, listingEnabledOnly])

  return [marketplaces, setMarketplaces]
}
