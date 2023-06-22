import { useEffect, useState } from 'react'
import useReservoirClient from './useReservoirClient'
import { Marketplace } from './useMarketplaces'
import { Listings } from '../modal/list/ListModalRenderer'
import { useWalletClient } from 'wagmi'
import { Execute } from '@reservoir0x/reservoir-sdk'

export default function (
  marketplaces: Marketplace[],
  tokenId?: string,
  collectionId?: string
) {
  const [unapprovedMarketplaces, setUnapprovedMarketplaces] = useState<
    Marketplace[]
  >([])
  const [isFetching, setIsFetching] = useState(false)
  const client = useReservoirClient()
  const { data: wallet } = useWalletClient()

  useEffect(() => {
    if (
      wallet &&
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
      setIsFetching(true)
      client.actions
        .listToken({
          listings: listings,
          wallet,
          precheck: true,
        })
        .then((data: any) => {
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
                  item.orderIndexes !== undefined
                ) {
                  const listingOrderKinds = listings
                    .filter((_, i) => item.orderIndexes?.includes(i))
                    .map((listing) => listing.orderKind)
                  marketplaces.forEach((marketplace) => {
                    if (
                      listingOrderKinds.includes(marketplace.orderKind as any)
                    ) {
                      unapproved.push(marketplace)
                    }
                  })
                }
                return unapproved
              }, [] as Marketplace[])
            )
          } else if (unapprovedMarketplaces.length > 0) {
            setUnapprovedMarketplaces([])
          }
          setIsFetching(false)
        })
        .catch(() => {
          setIsFetching(false)
        })
    } else if (unapprovedMarketplaces.length > 0) {
      setUnapprovedMarketplaces([])
    }
  }, [client, wallet, tokenId, collectionId, marketplaces.length])

  return { data: unapprovedMarketplaces, isFetching }
}
