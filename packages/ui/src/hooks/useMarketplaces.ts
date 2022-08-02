import { paths } from '@reservoir0x/reservoir-kit-client'
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
  listingEnabledOnly?: boolean
): [Marketplace[], React.Dispatch<React.SetStateAction<Marketplace[]>>] {
  const [marketplaces, setMarketplaces] = useState<Marketplace[]>([])
  const client = useReservoirClient()

  useEffect(() => {
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
            //todo check local name
            marketplace.name = 'Chimpers Marketplace'
            marketplace.imageUrl =
              'https://uploads-ssl.webflow.com/620e7cf70a42fe89735b1b17/62901415219ac32d60cc658b_chimpers-logo-head.png'
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
  }, [client])

  return [marketplaces, setMarketplaces]
}
