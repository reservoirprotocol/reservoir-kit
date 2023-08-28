import React, {
  FC,
  useEffect,
  useState,
  useCallback,
  ReactNode,
  useMemo,
} from 'react'
import { useTokens, useCoinConversion, useReservoirClient } from '../../hooks'
import { useAccount, useWalletClient, useNetwork } from 'wagmi'
import {
  Execute,
  ExpectedPrice,
  ReservoirClientActions,
  SellPath,
} from '@reservoir0x/reservoir-sdk'
import { Currency } from '../../types/Currency'
import { parseUnits } from 'viem'

export enum AcceptBidStep {
  Checkout,
  Auth,
  ApproveMarketplace,
  Finalizing,
  Complete,
  Unavailable,
}

export type AcceptBidTokenData = {
  tokenId: string
  collectionId: string
  bidIds?: string[]
  bidsPath?: NonNullable<SellPath>
}

export type EnhancedAcceptBidTokenData = Required<AcceptBidTokenData> & {
  tokenData?: ReturnType<typeof useTokens>['data'][0]
}

export type AcceptBidPrice = {
  netAmount: number
  amount: number
  currency: Currency
  royalty: number
  marketplaceFee: number
}

export type AcceptBidStepData = {
  totalSteps: number
  steps: Execute['steps']
  currentStep: Execute['steps'][0]
  currentStepItem?: NonNullable<Execute['steps'][0]['items']>[0]
}

type ChildrenProps = {
  loading: boolean
  tokensData: EnhancedAcceptBidTokenData[]
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
  const client = useReservoirClient()
  const { data: wallet } = useWalletClient()
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
  const [isFetchingBidPath, setIsFetchingBidPath] = useState(false)
  const [bidsPath, setBidsPath] = useState<SellPath | null>(null)

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
      normalizeRoyalties,
    },
    {
      revalidateFirstPage: true,
    }
  )

  const enhancedTokens = useMemo(() => {
    const tokensDataMap = tokensData.reduce((map, data) => {
      map[`${data.token?.contract}:${data.token?.tokenId}`] = data
      return map
    }, {} as Record<string, typeof tokensData[0]>)
    const tokensBidPathMap =
      bidsPath?.reduce((map, path) => {
        const key = `${path.contract}:${path.tokenId}`
        const mapPath = map[key]
        if (!mapPath) {
          map[key] = [path]
        } else {
          mapPath.push(path)
        }
        return map
      }, {} as Record<string, NonNullable<AcceptBidTokenData['bidsPath']>>) ||
      {}

    return tokens.reduce((enhancedTokens, token) => {
      const contract = token.collectionId.split(':')[0]
      const dataMapKey = `${contract}:${token.tokenId}`
      const tokenData = tokensDataMap[dataMapKey]
      const bidIds = token.bidIds?.filter((bidId) => bidId.length > 0) || []
      const bidsPath: NonNullable<AcceptBidTokenData['bidsPath']> =
        tokensBidPathMap[dataMapKey] ? tokensBidPathMap[dataMapKey] : []
      if (!bidIds.length) {
        enhancedTokens.push({
          ...token,
          bidIds: tokenData?.market?.topBid?.id
            ? [tokenData.market.topBid.id]
            : [],
          tokenData,
          bidsPath,
        })
      } else {
        enhancedTokens.push({
          ...token,
          bidIds: token.bidIds || [],
          tokenData,
          bidsPath,
        })
      }
      return enhancedTokens
    }, [] as EnhancedAcceptBidTokenData[])
  }, [tokensData, tokens, bidsPath])

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

  const fetchBidsPath = useCallback(
    (tokens: AcceptBidTokenData[]) => {
      if (!wallet || !client) {
        setIsFetchingBidPath(false)
        return
      }
      setIsFetchingBidPath(true)
      type AcceptOfferOptions = Parameters<
        ReservoirClientActions['acceptOffer']
      >['0']['options']
      let options: AcceptOfferOptions = {
        onlyPath: true,
        partial: true,
      }
      if (normalizeRoyalties !== undefined) {
        options.normalizeRoyalties = normalizeRoyalties
      }

      type AcceptBidItems = Parameters<
        ReservoirClientActions['acceptOffer']
      >[0]['items']
      const items: AcceptBidItems = tokens?.reduce((items, token) => {
        if (tokens) {
          const contract = token.collectionId.split(':')[0]
          const bids = token.bidIds
            ? token.bidIds.filter((bid) => bid.length > 0)
            : []
          if (bids && bids.length > 0) {
            bids.forEach((bidId) => {
              items.push({
                orderId: bidId,
                token: `${contract}:${token.tokenId}`,
              })
            })
          } else {
            items.push({
              token: `${contract}:${token.tokenId}`,
            })
          }
        }
        return items
      }, [] as AcceptBidItems)

      client.actions
        .acceptOffer({
          items: items,
          wallet,
          options,
          precheck: true,
          onProgress: () => {},
        })
        .then((data) => {
          setBidsPath(
            'path' in (data as any)
              ? ((data as Execute)['path'] as SellPath)
              : null
          )
        })
        .finally(() => {
          setIsFetchingBidPath(false)
        })
    },
    [client, wallet, normalizeRoyalties]
  )

  useEffect(() => {
    if (open) {
      fetchBidsPath(tokens)
    }
  }, [client, tokens, open])

  const currencySymbols = useMemo(
    () =>
      Array.from(
        enhancedTokens.reduce((symbols, { bidsPath }) => {
          bidsPath.forEach(({ currencySymbol }) => {
            if (currencySymbol) {
              symbols.add(currencySymbol)
            }
          })
          return symbols
        }, new Set() as Set<string>)
      ).join(','),
    [enhancedTokens]
  )

  const conversions = useCoinConversion(
    open && currencySymbols.length > 0 ? 'USD' : undefined,
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
    setTransactionError(null)
    if (!wallet) {
      const error = new Error('Missing a wallet/signer')
      setTransactionError(error)
      throw error
    }

    if (!bidsPath) {
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

    setAcceptBidStep(AcceptBidStep.ApproveMarketplace)

    type AcceptBidItems = Parameters<
      ReservoirClientActions['acceptOffer']
    >[0]['items']
    const items: AcceptBidItems = bidsPath.map(
      ({ orderId, tokenId, contract }) => ({
        orderId: orderId,
        token: `${contract}:${tokenId}`,
      })
    )

    const expectedPrice: Record<string, ExpectedPrice> = {}
    for (let currency in prices) {
      expectedPrice[currency] = {
        amount: prices[currency].netAmount,
        raw: parseUnits(
          `${prices[currency].netAmount}`,
          prices[currency].currency.decimals || 18
        ),
        currencyAddress: prices[currency].currency.contract,
        currencyDecimals: prices[currency].currency.decimals || 18,
      }
    }

    let hasError = false

    client.actions
      .acceptOffer({
        expectedPrice,
        wallet,
        items,
        onProgress: (steps: Execute['steps'], path: Execute['path']) => {
          if (!steps || hasError) return
          setBidsPath(path)
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
              steps,
            })
            if (currentStep.id === 'auth') {
              setAcceptBidStep(AcceptBidStep.Auth)
            } else if (currentStep.id === 'nft-approval') {
              setAcceptBidStep(AcceptBidStep.ApproveMarketplace)
            } else if (currentStep.id === 'sale') {
              if (
                currentStep.items?.every((item) => item.txHash !== undefined)
              ) {
                setAcceptBidStep(AcceptBidStep.Finalizing)
              } else {
                setAcceptBidStep(AcceptBidStep.ApproveMarketplace)
              }
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
                steps,
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
        hasError = true
        setTransactionError(transactionError)
        setAcceptBidStep(AcceptBidStep.Checkout)
        setStepData(null)
        fetchBidsPath(tokens)
        mutateTokens()
      })
  }, [bidsPath, bidTokenMap, client, wallet, prices, mutateTokens])

  useEffect(() => {
    if (bidsPath && bidsPath.length > 0) {
      const prices: Record<string, AcceptBidPrice> = bidsPath.reduce(
        (
          map,
          {
            quote,
            currency,
            currencyDecimals,
            currencySymbol,
            builtInFees,
            feesOnTop,
            totalPrice,
          }
        ) => {
          const netAmount = quote || 0
          const amount = totalPrice || 0
          let royalty = 0
          let marketplaceFee = 0

          if (currency && currencySymbol) {
            builtInFees?.forEach((fee) => {
              switch (fee.kind) {
                case 'marketplace': {
                  marketplaceFee = fee.amount || 0
                  break
                }
                case 'royalty': {
                  royalty = fee.amount || 0
                  break
                }
              }
            })
            feesOnTop?.forEach((fee) => {
              switch (fee.kind) {
                case 'marketplace': {
                  marketplaceFee = fee.amount || 0
                  break
                }
                case 'royalty': {
                  royalty = fee.amount || 0
                  break
                }
              }
            })
            if (!map[currencySymbol]) {
              map[currencySymbol] = {
                netAmount,
                amount,
                currency: {
                  contract: currency,
                  symbol: currencySymbol,
                  decimals: currencyDecimals,
                },
                royalty,
                marketplaceFee,
              }
            } else if (map[currencySymbol]) {
              map[currencySymbol].netAmount += netAmount
              map[currencySymbol].amount += amount
              map[currencySymbol].royalty += royalty
              map[currencySymbol].marketplaceFee += marketplaceFee
            }
          }
          return map
        },
        {} as Record<string, AcceptBidPrice>
      )

      setPrices(Object.values(prices))
      if (acceptBidStep === AcceptBidStep.Unavailable) {
        setAcceptBidStep(AcceptBidStep.Checkout)
      }
    } else if (!isFetchingBidPath) {
      setPrices([])
      setAcceptBidStep(AcceptBidStep.Unavailable)
    }
  }, [client, bidsPath, isFetchingBidPath])

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
        loading: isFetchingBidPath || isFetchingTokenData,
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
