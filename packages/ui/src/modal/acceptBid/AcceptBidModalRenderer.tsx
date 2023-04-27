import React, {
  FC,
  useEffect,
  useState,
  useCallback,
  ReactNode,
  useMemo,
} from 'react'
import {
  useTokens,
  useCoinConversion,
  useReservoirClient,
  useBids,
} from '../../hooks'
import { useAccount, useSigner, useNetwork } from 'wagmi'
import { Execute, ReservoirClientActions } from '@reservoir0x/reservoir-sdk'
import { utils } from 'ethers'

export enum AcceptBidStep {
  Checkout,
  ApproveMarketplace,
  Confirming,
  Finalizing,
  Complete,
  Unavailable,
}

export type AcceptBidTokenData = {
  tokenId: string
  collectionId: string
  bidIds?: string[]
}

export type EnhancedAcceptBidTokenData = Required<AcceptBidTokenData> & {
  tokenData?: ReturnType<typeof useTokens>['data'][0]
}

export type AcceptBidPrice = {
  netAmount: number
  amount: number
  currency: NonNullable<
    ReturnType<typeof useBids>['data'][0]['price']
  >['currency']
  royalty: number
  marketplaceFee: number
}

export type AcceptBidStepData = {
  totalSteps: number
  currentStep: Execute['steps'][0]
  currentStepItem?: NonNullable<Execute['steps'][0]['items']>[0]
}

type ChildrenProps = {
  loading: boolean
  tokensData: EnhancedAcceptBidTokenData[]
  bids: (NonNullable<ReturnType<typeof useBids>['data']>[0] & {
    tokenData: EnhancedAcceptBidTokenData['tokenData']
  })[]
  acceptBidStep: AcceptBidStep
  transactionError?: Error | null
  txHash: string | null
  usdPrices: Record<string, ReturnType<typeof useCoinConversion>[0]>
  prices: AcceptBidPrice[]
  address?: string
  blockExplorerBaseUrl: string
  stepData: AcceptBidStepData | null
  acceptBid: () => void
  setAcceptBidStep: React.Dispatch<React.SetStateAction<AcceptBidStep>>
}

type Props = {
  open: boolean
  tokens: AcceptBidTokenData[]
  normalizeRoyalties?: boolean
  children: (props: ChildrenProps) => ReactNode
}

export const AcceptBidModalRenderer: FC<Props> = ({
  open,
  tokens,
  normalizeRoyalties,
  children,
}) => {
  const { data: signer } = useSigner()
  const [stepData, setStepData] = useState<AcceptBidStepData | null>(null)
  const [prices, setPrices] = useState<AcceptBidPrice[]>([])
  const [acceptBidStep, setAcceptBidStep] = useState<AcceptBidStep>(
    AcceptBidStep.Checkout
  )
  const [transactionError, setTransactionError] = useState<Error | null>()
  const [txHash, setTxHash] = useState<string | null>(null)
  const { chain: activeChain } = useNetwork()
  const blockExplorerBaseUrl =
    activeChain?.blockExplorers?.etherscan?.url || 'https://etherscan.io'

  const _tokenIds = tokens.map((token) => {
    const contract = (token?.collectionId || '').split(':')[0]
    return `${contract}:${token.tokenId}`
  })
  const {
    data: tokensData,
    mutate: mutateTokens,
    isValidating: isFetchingTokenData,
  } = useTokens(
    open && {
      tokens: _tokenIds,
      includeTopBid: true,
      normalizeRoyalties,
    },
    {
      revalidateFirstPage: true,
    }
  )

  const enhancedTokens = useMemo(() => {
    const tokensDataMap = tokensData.reduce((map, data) => {
      map[`${data.token?.collection?.id}:${data.token?.tokenId}`] = data
      return map
    }, {} as Record<string, typeof tokensData[0]>)

    return tokens.reduce((enhancedTokens, token) => {
      const dataMapKey = `${token.collectionId}:${token.tokenId}`
      const tokenData = tokensDataMap[dataMapKey]
      const bidIds = token.bidIds?.filter((bidId) => bidId.length > 0) || []
      if (!bidIds.length) {
        if (tokenData && tokenData.market?.topBid?.id) {
          enhancedTokens.push({
            ...token,
            bidIds: tokenData.market.topBid.id
              ? [tokenData.market.topBid.id]
              : [],
            tokenData,
          })
        }
      } else {
        enhancedTokens.push({
          ...token,
          bidIds: token.bidIds || [],
          tokenData,
        })
      }
      return enhancedTokens
    }, [] as EnhancedAcceptBidTokenData[])
  }, [tokensData, tokens])

  const bidTokenMap = useMemo(
    () =>
      enhancedTokens.reduce((map, token) => {
        token.bidIds.forEach((bidId) => {
          map[bidId] = token
        })
        return map
      }, {} as Record<string, typeof enhancedTokens[0]>),
    [enhancedTokens]
  )

  const bidIds = enhancedTokens.map((token) => token.bidIds).flat()

  const {
    data: bidData,
    isValidating: isFetchingBidData,
    mutate: mutateBids,
  } = useBids(
    {
      ids: bidIds,
      status: 'active',
      includeCriteriaMetadata: true,
      normalizeRoyalties,
    },
    {
      revalidateFirstPage: true,
    },
    open && bidIds.length > 0 ? true : false
  )

  const bids = useMemo(
    () =>
      bidData
        .filter((bid) => {
          const tokenData = bidTokenMap[bid.id]
          if (
            bid &&
            bid.status === 'active' &&
            bid.price?.netAmount?.decimal !== undefined &&
            bid.criteria?.data?.collection?.id === tokenData.collectionId
          ) {
            if (bid.criteria?.kind === 'token') {
              const tokenSetPieces = bid.tokenSetId.split(':')
              const bidTokenId = tokenSetPieces[tokenSetPieces.length - 1]
              if (tokenData.tokenId === bidTokenId) {
                return true
              }
            } else {
              return true
            }
          }
          return false
        })
        .map((bid) => ({ ...bid, tokenData: bidTokenMap[bid.id].tokenData })),
    [bidData, bidTokenMap]
  )

  const client = useReservoirClient()

  const currencySymbols = useMemo(
    () =>
      Array.from(
        bids.reduce((symbols, bid) => {
          if (bid.price?.currency?.symbol) {
            symbols.add(bid.price?.currency?.symbol)
          }
          return symbols
        }, new Set() as Set<string>)
      ).join(''),
    [bids]
  )

  const conversions = useCoinConversion(
    open && bidIds.length > 0 ? 'USD' : undefined,
    currencySymbols
  )

  const usdPrices = useMemo(
    () =>
      conversions.reduce((map, price) => {
        map[price.symbol] = price
        return map
      }, {} as ChildrenProps['usdPrices']),
    [conversions]
  )

  const acceptBid = useCallback(() => {
    if (!signer) {
      const error = new Error('Missing a signer')
      setTransactionError(error)
      throw error
    }

    if (!bids) {
      const error = new Error('Missing bids to accept')
      setTransactionError(error)
      throw error
    }

    if (!client) {
      const error = new Error('ReservoirClient was not initialized')
      setTransactionError(error)
      setTransactionError(null)
      throw error
    }

    type AcceptOfferOptions = Parameters<
      ReservoirClientActions['acceptOffer']
    >['0']['options']
    let options: AcceptOfferOptions = {
      partial: true,
    }

    if (normalizeRoyalties !== undefined) {
      options.normalizeRoyalties = normalizeRoyalties
    }

    setAcceptBidStep(AcceptBidStep.Confirming)

    type AcceptBidItems = Parameters<
      ReservoirClientActions['acceptOffer']
    >[0]['items']
    const items: AcceptBidItems = bids?.reduce((items, bid) => {
      const tokenData = bidTokenMap[bid.id]
      if (tokenData) {
        const contract = tokenData.collectionId.split(':')[0]
        items.push({
          orderId: bid.id,
          token: `${contract}${tokenData.tokenId}`,
        })
      }
      return items
    }, [] as AcceptBidItems)

    const expectedPrice: Record<string, number> = {}
    for (let currency in prices) {
      expectedPrice[currency] = prices[currency].amount
    }

    client.actions
      .acceptOffer({
        expectedPrice,
        signer,
        items,
        onProgress: (steps: Execute['steps']) => {
          if (!steps) return
          const executableSteps = steps.filter(
            (step) => step.items && step.items.length > 0
          )

          let stepCount = executableSteps.length

          let currentStepItem:
            | NonNullable<Execute['steps'][0]['items']>[0]
            | undefined
          let currentStepIndex: number = 0
          executableSteps.find((step, index) => {
            currentStepIndex = index
            currentStepItem = step.items?.find(
              (item) => item.status === 'incomplete'
            )
            return currentStepItem
          })

          const currentStep =
            currentStepIndex > -1
              ? executableSteps[currentStepIndex]
              : executableSteps[stepCount - 1]

          if (currentStepItem) {
            setStepData({
              totalSteps: stepCount,
              currentStep,
              currentStepItem,
            })
            if (currentStepIndex !== executableSteps.length - 1) {
              setAcceptBidStep(AcceptBidStep.ApproveMarketplace)
            } else if (currentStepItem.txHash) {
              setTxHash(currentStepItem.txHash)
              setAcceptBidStep(AcceptBidStep.Finalizing)
            } else {
              setAcceptBidStep(AcceptBidStep.Confirming)
            }
          } else if (
            executableSteps.every(
              (step) =>
                !step.items ||
                step.items.length == 0 ||
                step.items?.every((item) => item.status === 'complete')
            )
          ) {
            setAcceptBidStep(AcceptBidStep.Complete)
            const lastStepItem = currentStep.items
              ? currentStep.items[currentStep.items?.length - 1]
              : undefined
            if (lastStepItem) {
              setStepData({
                totalSteps: stepCount,
                currentStep,
                currentStepItem: lastStepItem,
              })
            }
          }
        },
        options,
      })
      .catch((e: any) => {
        const error = e as Error
        const errorType = (error as any)?.type
        let message = 'Oops, something went wrong. Please try again.'
        if (errorType && errorType === 'price mismatch') {
          message = error.message
        }
        //@ts-ignore
        const transactionError = new Error(message, {
          cause: error,
        })
        setTransactionError(transactionError)
        setAcceptBidStep(AcceptBidStep.Checkout)
        setStepData(null)
        mutateBids()
        mutateTokens()
      })
  }, [bids, bidTokenMap, client, signer, prices, mutateTokens, mutateBids])

  useEffect(() => {
    if (bids && bids.length > 0) {
      const prices: Record<string, AcceptBidPrice> = bids.reduce((map, bid) => {
        const price = bid.price
        const currency = price?.currency
        const netAmount = price?.netAmount?.decimal || 0
        const amount = price?.amount?.decimal || 0
        let royalty = 0
        let marketplaceFee = 0

        if (currency && currency.symbol) {
          bid.feeBreakdown?.forEach((fee) => {
            const feeAmount = utils
              .parseUnits(`${amount}`, currency.decimals)
              .mul(fee.bps || 0)
              .div(10000)
            switch (fee.kind) {
              case 'marketplace': {
                marketplaceFee = feeAmount.toNumber()
                break
              }
              case 'royalty': {
                royalty = feeAmount.toNumber()
                break
              }
            }
          })
          if (!map[currency.symbol]) {
            map[currency.symbol] = {
              netAmount,
              amount,
              currency,
              royalty,
              marketplaceFee,
            }
          } else if (map[currency.symbol]) {
            map[currency.symbol].netAmount += netAmount
            map[currency.symbol].amount += amount
            map[currency.symbol].royalty += royalty
            map[currency.symbol].marketplaceFee += marketplaceFee
          }
        }
        return map
      }, {} as Record<string, AcceptBidPrice>)

      setPrices(Object.values(prices))
      setAcceptBidStep(AcceptBidStep.Checkout)
    } else if (!isFetchingBidData) {
      setPrices([])
      setAcceptBidStep(AcceptBidStep.Unavailable)
    }
  }, [client, bids, isFetchingBidData])

  const { address } = useAccount()

  useEffect(() => {
    if (!open) {
      setAcceptBidStep(AcceptBidStep.Checkout)
      setTxHash(null)
      setStepData(null)
      setTransactionError(null)
    }
  }, [open])

  return (
    <>
      {children({
        loading: isFetchingBidData || isFetchingTokenData,
        bids,
        tokensData: enhancedTokens,
        acceptBidStep,
        transactionError,
        txHash,
        usdPrices,
        prices,
        address,
        blockExplorerBaseUrl,
        acceptBid,
        setAcceptBidStep,
        stepData,
      })}
    </>
  )
}
