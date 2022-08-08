import { paths } from '@reservoir0x/reservoir-kit-client'
import getLocalMarketplaceData from '../lib/getLocalMarketplaceData'
import { useEffect, useState } from 'react'
import useReservoirClient from './useReservoirClient'

export type Marketplace = NonNullable<
  paths['/admin/get-marketplaces']['get']['responses']['200']['schema']['marketplaces']
>[0] & {
  isSelected: boolean
  price: number
  truePrice: number
}

export default function (
  fetchMarketplaces: boolean,
  listingEnabledOnly?: boolean
): [Marketplace[], React.Dispatch<React.SetStateAction<Marketplace[]>>] {
  const [marketplaces, setMarketplaces] = useState<Marketplace[]>([])
  const client = useReservoirClient()

  useEffect(() => {
    if (fetchMarketplaces) {
      const path = new URL(`${client?.apiBase}/admin/get-marketplaces`)
      fetch(path)
        .then((response) => response.json())
        .then((resp) => {
          let marketplaces: Marketplace[] =
            resp && resp.marketplaces ? resp.marketplaces : []
          if (listingEnabledOnly) {
            marketplaces = marketplaces.filter(
              (marketplace) => marketplace.listingEnabled
            )
          }
          marketplaces.forEach((marketplace) => {
            if (marketplace.orderbook === 'reservoir') {
              const data = getLocalMarketplaceData()
              marketplace.name = data.title
              marketplace.feeBps = client?.fee ? Number(client.fee) : 0
              if (data.icon) {
                marketplace.imageUrl = data.icon
              }
            }
            marketplace.price = 0
            marketplace.truePrice = 0
            marketplace.isSelected =
              marketplace.orderbook === 'reservoir' ? true : false
          })
          setMarketplaces(marketplaces)
        })
        .catch((err) => {
          console.error(err.message)
        })
    }
  }, [client, fetchMarketplaces])

  return [marketplaces, setMarketplaces]
}
