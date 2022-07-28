import React, { FC, useState, useMemo, ReactNode } from 'react'
import {
  useCollection,
  useTokenDetails,
  useEthConversion,
  useTokenOpenseaBanned,
} from '../../hooks'
import { useAccount, useBalance, useNetwork } from 'wagmi'

import { BigNumber } from 'ethers'

export enum ListStep {
  SelectMarkets,
  SetPrice,
  ListItem,
  Complete,
}

type ChildrenProps = {
  token:
    | false
    | NonNullable<
        NonNullable<ReturnType<typeof useTokenDetails>>['tokens']
      >['0']
  collection: ReturnType<typeof useCollection>
  listStep: ListStep
  txHash: string | null
  ethUsdPrice: ReturnType<typeof useEthConversion>
  isBanned: boolean
  balance?: BigNumber
  address?: string
  etherscanBaseUrl: string
  setListStep: React.Dispatch<React.SetStateAction<ListStep>>
}

type Props = {
  open: boolean
  tokenId?: string
  collectionId?: string
  children: (props: ChildrenProps) => ReactNode
}

export const ListModalRenderer: FC<Props> = ({
  open,
  tokenId,
  collectionId,
  children,
}) => {
  const [listStep, setListStep] = useState<ListStep>(ListStep.Complete)
  const [txHash] = useState<string | null>(null)
  const { chain: activeChain } = useNetwork()
  const etherscanBaseUrl =
    activeChain?.blockExplorers?.etherscan?.url || 'https://etherscan.io'

  const tokenQuery = useMemo(
    () => ({
      tokens: [`${collectionId}:${tokenId}`],
    }),
    [collectionId, tokenId]
  )

  const collectionQuery = useMemo(
    () => ({
      id: collectionId,
    }),
    [collectionId]
  )

  const tokenDetails = useTokenDetails(open && tokenQuery)
  const collection = useCollection(open && collectionQuery)

  let token = !!tokenDetails?.tokens?.length && tokenDetails?.tokens[0]

  const ethUsdPrice = useEthConversion(open ? 'USD' : undefined)

  const { address } = useAccount()
  const { data: balance } = useBalance({
    addressOrName: address,
    watch: true,
  })

  const isBanned = useTokenOpenseaBanned(
    open ? collectionId : undefined,
    tokenId
  )

  return (
    <>
      {children({
        token,
        collection,
        listStep,
        setListStep,
        txHash,
        ethUsdPrice,
        isBanned,
        balance: balance?.value,
        address: address,
        etherscanBaseUrl,
      })}
    </>
  )
}
