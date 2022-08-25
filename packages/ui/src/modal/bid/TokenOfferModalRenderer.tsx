import React, { FC, useEffect, useState, useCallback, ReactNode } from 'react'
import {
  useCollection,
  useTokenDetails,
  useCoinConversion,
  useReservoirClient,
  useTokenOpenseaBanned,
  useWethBalance,
} from '../../hooks'
import { useAccount, useBalance, useNetwork, useSigner } from 'wagmi'

import { BigNumber, constants, utils } from 'ethers'
import { Execute } from '@reservoir0x/reservoir-kit-client'
import { ExpirationOption } from '../../types/ExpirationOption'
import defaultExpirationOptions from '../../lib/defaultExpirationOptions'
import { formatBN } from '../../lib/numbers'

const expirationOptions = [
  ...defaultExpirationOptions,
  {
    text: 'Custom',
    value: 'custom',
    relativeTime: null,
    relativeTimeUnit: null,
  },
]

export enum TokenOfferStep {
  SetPrice,
  Offering,
  Complete,
}

type ChildrenProps = {
  token:
    | false
    | NonNullable<NonNullable<ReturnType<typeof useTokenDetails>>['data']>[0]
  collection: ReturnType<typeof useCollection>['data']
  bidAmount: string
  tokenOfferStep: TokenOfferStep
  hasEnoughEth: boolean
  hasEnoughWEth: boolean
  ethAmountToWrap: string
  ethUsdPrice: ReturnType<typeof useCoinConversion>
  isBanned: boolean
  balance?: BigNumber
  wethBalance?: BigNumber
  wethUniswapLink: string
  transactionError?: Error | null
  expirationOptions: ExpirationOption[]
  expirationOption: ExpirationOption
  setTokenOfferStep: React.Dispatch<React.SetStateAction<TokenOfferStep>>
  setBidAmount: React.Dispatch<React.SetStateAction<string>>
  setExpirationOption: React.Dispatch<React.SetStateAction<ExpirationOption>>
  placeBid: () => void
}

type Props = {
  open: boolean
  tokenId?: string
  collectionId?: string
  children: (props: ChildrenProps) => ReactNode
}

export const TokenOfferModalRenderer: FC<Props> = ({
  open,
  tokenId,
  collectionId,
  children,
}) => {
  const { data: signer } = useSigner()
  const [tokenOfferStep, setTokenOfferStep] = useState<TokenOfferStep>(
    TokenOfferStep.SetPrice
  )
  const [transactionError, setTransactionError] = useState<Error | null>()
  const [bidAmount, setBidAmount] = useState<string>('')
  const [expirationOption, setExpirationOption] = useState<ExpirationOption>(
    expirationOptions[0]
  )
  const [hasEnoughEth, setHasEnoughEth] = useState(false)
  const [hasEnoughWEth, setHasEnoughWEth] = useState(false)
  const [ethAmountToWrap, setEthAmountToWrap] = useState('')

  const { data: tokens } = useTokenDetails(
    open && {
      tokens: [`${collectionId}:${tokenId}`],
      includeTopBid: true,
    }
  )
  const { data: collection } = useCollection(
    open && {
      id: collectionId,
      includeTopBid: true,
    }
  )
  let token = !!tokens?.length && tokens[0]

  const ethUsdPrice = useCoinConversion(open ? 'USD' : undefined)
  // const feeUsd = referrerFee * (ethUsdPrice || 0)
  // const totalUsd = totalPrice * (ethUsdPrice || 0)

  const client = useReservoirClient()

  const { address } = useAccount()
  const { data: balance } = useBalance({
    addressOrName: address,
    watch: open,
  })

  const {
    balance: { data: wethBalance },
    contractAddress,
  } = useWethBalance({
    addressOrName: address,
    watch: open,
  })

  const { chain } = useNetwork()
  const wethUniswapLink = `https://app.uniswap.org/#/swap?theme=dark&exactAmount=${ethAmountToWrap}&chain=${
    chain?.network || 'mainnet'
  }&inputCurrency=eth&outputCurrency=${contractAddress}`

  useEffect(() => {
    if (bidAmount !== '') {
      const bid = utils.parseEther(bidAmount)
      if (!balance?.value || balance.value.lt(bid)) {
        setHasEnoughEth(false)
      } else {
        setHasEnoughEth(true)
      }

      if (!wethBalance?.value || wethBalance?.value.lt(bid)) {
        setHasEnoughWEth(false)
        const wethAmount = wethBalance?.value || constants.Zero
        setEthAmountToWrap(formatBN(bid.sub(wethAmount), 5))
      } else {
        setHasEnoughWEth(true)
        setEthAmountToWrap('')
      }
    } else {
      setHasEnoughEth(true)
      setHasEnoughWEth(true)
      setEthAmountToWrap('')
    }
  }, [bidAmount, balance, wethBalance])

  useEffect(() => {
    if (!open) {
      //cleanup
      setTokenOfferStep(TokenOfferStep.SetPrice)
      setExpirationOption(expirationOptions[0])
      setHasEnoughEth(false)
      setHasEnoughWEth(false)
      setEthAmountToWrap('')
      setBidAmount('')
    }
  }, [open])

  const isBanned = useTokenOpenseaBanned(
    open ? collectionId : undefined,
    tokenId
  )

  const placeBid = useCallback(() => {
    if (!signer) {
      const error = new Error('Missing a signer')
      setTransactionError(error)
      throw error
    }

    if (!tokenId || !collectionId) {
      const error = new Error('Missing tokenId or collectionId')
      setTransactionError(error)
      throw error
    }

    if (!client) {
      const error = new Error('ReservoirClient was not initialized')
      setTransactionError(error)
      throw error
    }

    setTokenOfferStep(TokenOfferStep.Offering)

    client.actions
      .placeBid({
        signer,
        bids: [],
        onProgress: (steps: Execute['steps']) => {},
      })
      .catch((e: any) => {
        const transactionError = new Error(e?.message || '', {
          cause: e,
        })
        setTransactionError(transactionError)
        setTokenOfferStep(TokenOfferStep.SetPrice)
        console.log(e)
      })
  }, [tokenId, collectionId, client, signer])

  return (
    <>
      {children({
        token,
        collection,
        ethUsdPrice,
        isBanned,
        balance: balance?.value,
        wethBalance: wethBalance?.value,
        wethUniswapLink,
        bidAmount,
        tokenOfferStep,
        hasEnoughEth,
        hasEnoughWEth,
        ethAmountToWrap,
        transactionError,
        expirationOption,
        expirationOptions,
        setTokenOfferStep,
        setBidAmount,
        setExpirationOption,
        placeBid,
      })}
    </>
  )
}
