import { useCollections, useReservoirClient, useTokens } from '../../hooks'
import React, { ReactElement, ReactNode, useMemo } from 'react'
import { SWRInfiniteConfiguration } from 'swr/infinite'

type Props = {
  contract?: string
  collectionId?: string
  token?: string
  swrOptions?: SWRInfiniteConfiguration
  chainId?: number
  children: (props: ChildrenProps) => ReactNode
}

export type Collection = ReturnType<typeof useCollections>['data']['0']
export type Token = ReturnType<typeof useTokens>['data']['0']
export type MintStages = NonNullable<NonNullable<Collection>['mintStages']>

type ChildrenProps = {
  collection?: Collection
  tokenData?: Token
  mintStages?: MintStages
  publicMintData?: MintStages['0']
  loading: boolean
}

export function CollectButtonRenderer({
  token,
  contract,
  collectionId,
  swrOptions,
  chainId,
  children,
}: Props): ReactElement {
  const client = useReservoirClient()
  const currentChain = client?.currentChain()
  const chain = chainId
    ? client?.chains.find(({ id }) => id === chainId) || currentChain
    : currentChain

  const { data: tokens, isFetchingPage: isFetchingTokens } = useTokens(
    token && !collectionId && !contract
      ? {
          tokens: [token],
        }
      : false,
    undefined,
    chain?.id
  )
  const _collectionId =
    !collectionId && tokens && tokens[0]
      ? tokens[0].token?.collection?.id
      : collectionId
  const collectionQuery: Parameters<typeof useCollections>[0] = useMemo(() => {
    let query: Parameters<typeof useCollections>[0] = {
      includeMintStages: true,
    }
    if (_collectionId) {
      query.id = _collectionId
    } else if (contract) {
      query.contract = contract
    } else {
      query = false
    }
    return query
  }, [_collectionId, contract])
  const { data: collections, isFetchingPage: isFetchingCollections } =
    useCollections(collectionQuery, swrOptions, chain?.id)

  const tokenData = tokens && tokens[0] ? tokens[0] : undefined
  const collection = collections && collections[0] ? collections[0] : undefined
  const mintStages = collection?.mintStages
  const publicMintData = collection?.mintStages?.find(
    (stage) => stage.kind === 'public'
  )

  return (
    <>
      {children({
        publicMintData,
        mintStages,
        collection,
        tokenData,
        loading:
          ((contract !== undefined || collection !== undefined) &&
            isFetchingCollections &&
            !collection) ||
          (token !== undefined && isFetchingTokens && !tokenData),
      })}
    </>
  )
}

export default CollectButtonRenderer
