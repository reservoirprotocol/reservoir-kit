import CollectButtonRenderer from './CollectButtonRenderer'
import { Button } from '../../primitives'
import React, { ReactElement } from 'react'
import { SWRInfiniteConfiguration } from 'swr/infinite'

type Props = {
  contract?: string
  collectionId?: string
  token?: string
  swrOptions?: SWRInfiniteConfiguration
  chainId?: number
}

export function CollectButton({
  token,
  contract,
  collectionId,
  swrOptions,
  chainId,
}: Props): ReactElement {
  return (
    <CollectButtonRenderer
      token={token}
      contract={contract}
      collectionId={collectionId}
      swrOptions={swrOptions}
      chainId={chainId}
    >
      {({ mintData, mintStages, collection }) => {
        console.log(mintData, collection)
        if (mintData) {
          //TODO change this to collect and use mint modal
          return <Button>Mint</Button>
        } else if (collection) {
          //TODO change this to collect and use mint modal
          return <Button>Sweep</Button>
        } else {
          return <Button>Loading</Button>
        }
      }}
    </CollectButtonRenderer>
  )
}

CollectButton.Custom = CollectButtonRenderer
