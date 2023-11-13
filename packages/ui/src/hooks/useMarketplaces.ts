import { paths } from '@reservoir0x/reservoir-sdk'
import getLocalMarketplaceData from '../lib/getLocalMarketplaceData'
import { useEffect, useState } from 'react'
import useReservoirClient from './useReservoirClient'
import useSWR from 'swr'

export type Marketplace = NonNullable<
  paths['/collections/{collection}/supported-marketplaces/v1']['get']['responses']['200']['schema']['marketplaces']
>[0] & {
  price: number | string
  truePrice: number | string
  fee: {
    bps: number
    percent: number
  }
}

export default function (
  collectionId?: string,
  listingEnabledOnly?: boolean,
  fees?: string[],
  chainId?: number,
  enabled: boolean = true
): [Marketplace[], React.Dispatch<React.SetStateAction<Marketplace[]>>] {
  const [marketplaces, setMarketplaces] = useState<Marketplace[]>([])
  const client = useReservoirClient()
  const chain =
    chainId !== undefined
      ? client?.chains.find((chain) => chain.id === chainId)
      : client?.currentChain()
  const path = new URL(
    `${chain?.baseApiUrl}/collections/${collectionId}/supported-marketplaces/v1`
  )

  const { data } = useSWR<
    paths['/collections/{collection}/supported-marketplaces/v1']['get']['responses'][200]['schema']
  >(
    collectionId && enabled
      ? [path.href, client?.apiKey, client?.version]
      : null,
    null
  )

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
          marketplace.domain = client?.source
          const marketplaceFees =
            fees || (chain?.marketplaceFees && chain.marketplaceFees.length > 0)
              ? chain?.marketplaceFees
              : client?.marketplaceFees
          const feeBps = marketplaceFees?.reduce((total, fee) => {
            const bps = Number(fee.split(':')[1])
            total += bps
            return total
          }, 0)
          marketplace.fee = {
            bps: feeBps || 0,
            percent: (feeBps || 0) / 100,
          }
          if (data.icon) {
            marketplace.imageUrl = data.icon
          }
        }
        if (marketplace.fee) {
          marketplace.fee.percent = (marketplace.fee.bps || 0) / 100
        }
        marketplace.price = 0
        marketplace.truePrice = 0
      })
      setMarketplaces(updatedMarketplaces)
    }
  }, [data, listingEnabledOnly, chain, chainId, fees])

  return [marketplaces, setMarketplaces]
}
