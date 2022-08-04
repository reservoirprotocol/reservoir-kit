import { useEffect, useState } from 'react'
import useReservoirClient from './useReservoirClient'
import { Marketplace } from './useMarketplaces'
import { Listings } from '../modal/list/ListModalRenderer'
import { useSigner } from 'wagmi'
import { Execute } from '@reservoir0x/reservoir-kit-client'

export default function (
  marketplaces: Marketplace[],
  tokenId?: string,
  collectionId?: string
) {
  const [unapprovedMarketplaces, setUnapprovedMarketplaces] = useState<
    Marketplace[]
  >([])
  const [marketplaceNames, setMarketplaceNames] = useState<string[]>([])
  const client = useReservoirClient()
  const { data: signer } = useSigner()

  useEffect(() => {
    const names = marketplaces.reduce((names, marketplace) => {
      if (marketplace.name) {
        names.push(marketplace.name)
      }
      return names
    }, [] as string[])

    const newName = names.some((name) => !marketplaceNames.includes(name))

    if (newName) {
      setMarketplaceNames(names)
    } else {
      const missingName = marketplaceNames.some(
        (marketplaceName) => !names.includes(marketplaceName)
      )
      if (missingName) {
        setMarketplaceNames(names)
      }
    }
  }, [marketplaces])

  useEffect(() => {
    if (
      signer &&
      client &&
      tokenId &&
      collectionId &&
      marketplaces.length > 0
    ) {
      const listings = marketplaces.map((market) => {
        const listing: Listings[0] = {
          token: `${collectionId}:${tokenId}`,
          weiPrice: '100000000000000000',
          //@ts-ignore
          orderbook: market.orderbook,
          //@ts-ignore
          orderKind: market.orderKind,
        }
        return listing
      })

      client.actions
        .listToken({
          listings: listings,
          signer,
          precheck: true,
        })
        .then((data) => {
          const steps = data as Execute['steps']
          const approvalStep = steps.find(
            (step) =>
              step.kind === 'transaction' && step.items && step.items.length > 0
          )
          if (approvalStep && approvalStep.items) {
            setUnapprovedMarketplaces(
              approvalStep.items.reduce((unapproved, item) => {
                if (
                  item.status === 'incomplete' &&
                  item.orderIndex !== undefined
                ) {
                  const listing = listings[item.orderIndex]
                  const marketplace = marketplaces.find(
                    (marketplace) =>
                      marketplace.orderbook === listing.orderbook &&
                      marketplace.orderKind === listing.orderKind
                  )
                  if (marketplace) {
                    unapproved.push(marketplace)
                  }
                }
                return unapproved
              }, [] as Marketplace[])
            )
          } else if (unapprovedMarketplaces.length > 0) {
            setUnapprovedMarketplaces([])
          }
        })
    } else if (unapprovedMarketplaces.length > 0) {
      setUnapprovedMarketplaces([])
    }
  }, [client, signer, tokenId, collectionId, marketplaceNames])

  return unapprovedMarketplaces
}
