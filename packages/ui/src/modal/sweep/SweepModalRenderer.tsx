import React, {
  FC,
  ReactNode,
  useCallback,
  useEffect,
  useState,
  useMemo,
} from 'react'
import {
  useChainCurrency,
  useCoinConversion,
  useReservoirClient,
  useTokens,
} from '../../hooks'
import {
  Address,
  useAccount,
  useBalance,
  useNetwork,
  useWalletClient,
} from 'wagmi'
import Token from '../list/Token'
import {
  Execute,
  ReservoirChain,
  ReservoirClientActions,
} from '@reservoir0x/reservoir-sdk'
import { toFixed } from '../../lib/numbers'
import { UseBalanceToken } from '../../types/wagmi'
import { formatUnits, parseUnits, zeroAddress } from 'viem'

export enum SweepStep {
  Idle,
  Approving,
  Finalizing,
  Complete,
}

export type SweepModalStepData = {
  totalSteps: number
  stepProgress: number
  currentStep: Execute['steps'][0]
  currentStepItem: NonNullable<Execute['steps'][0]['items']>[0]
  path: Execute['path']
}

type Token = ReturnType<typeof useTokens>['data'][0]

type FloorAskPrice = NonNullable<
  NonNullable<NonNullable<Token>['market']>['floorAsk']
>['price']

type BuyTokenOptions = Parameters<
  ReservoirClientActions['buyToken']
>['0']['options']

type Currency = NonNullable<
  NonNullable<NonNullable<Token['market']>['floorAsk']>['price']
>['currency']

type ChildrenProps = {
  loading: boolean
  selectedTokens: ReturnType<typeof useTokens>['data']
  setSelectedTokens: React.Dispatch<
    React.SetStateAction<ReturnType<typeof useTokens>['data']>
  >
  itemAmount?: number
  setItemAmount: React.Dispatch<React.SetStateAction<number | undefined>>
  ethAmount?: number
  setEthAmount: React.Dispatch<React.SetStateAction<number | undefined>>
  isItemsToggled: boolean
  setIsItemsToggled: React.Dispatch<React.SetStateAction<boolean>>
  maxInput: number
  setMaxInput: React.Dispatch<React.SetStateAction<number>>
  currency: ReturnType<typeof useChainCurrency>
  isChainCurrency: boolean
  total: number
  totalUsd: number
  currentChain: ReservoirChain | null | undefined
  availableTokens: ReturnType<typeof useTokens>['data']
  address?: string
  tokens: ReturnType<typeof useTokens>['data']
  balance?: bigint
  hasEnoughCurrency: boolean
  blockExplorerBaseUrl: string
  transactionError: Error | null | undefined
  stepData: SweepModalStepData | null
  setStepData: React.Dispatch<React.SetStateAction<SweepModalStepData | null>>
  sweepStep: SweepStep
  setSweepStep: React.Dispatch<React.SetStateAction<SweepStep>>
  sweepTokens: () => void
}

type Props = {
  open: boolean
  collectionId?: string
  referrerFeeBps?: number | null
  referrerFeeFixed?: number | null
  referrer?: string | null
  normalizeRoyalties?: boolean
  children: (props: ChildrenProps) => ReactNode
}

export const SweepModalRenderer: FC<Props> = ({
  open,
  collectionId,
  referrerFeeBps,
  referrerFeeFixed,
  referrer,
  normalizeRoyalties,
  children,
}) => {
  const { data: signer } = useWalletClient()
  const account = useAccount()
  const [selectedTokens, setSelectedTokens] = useState<
    ReturnType<typeof useTokens>['data']
  >([])
  const [itemAmount, setItemAmount] = useState<number | undefined>(undefined)
  const [ethAmount, setEthAmount] = useState<number | undefined>(undefined)
  const [isItemsToggled, setIsItemsToggled] = useState<boolean>(true)
  const [maxInput, setMaxInput] = useState<number>(0)
  const [sweepStep, setSweepStep] = useState<SweepStep>(SweepStep.Idle)
  const [stepData, setStepData] = useState<SweepModalStepData | null>(null)
  const [transactionError, setTransactionError] = useState<Error | null>()

  const [hasEnoughCurrency, setHasEnoughCurrency] = useState(true)

  const chainCurrency = useChainCurrency()
  const [currency, setCurrency] = useState(chainCurrency)

  const isChainCurrency = currency.address === chainCurrency.address

  const client = useReservoirClient()
  const currentChain = client?.currentChain()

  const { chains } = useNetwork()
  const chain = chains.find((chain) => chain.id === currentChain?.id)

  const blockExplorerBaseUrl =
    chain?.blockExplorers?.default?.url || 'https://etherscan.io'

  const {
    data: tokens,
    isFetchingPage: fetchingTokens,
    mutate: mutateTokens,
  } = useTokens(
    open && {
      collection: collectionId,
      normalizeRoyalties,
      limit: 100,
      includeDynamicPricing: true,
      sortBy: 'floorAskPrice',
      sortDirection: 'asc',
    },
    { revalidateFirstPage: true }
  )

  const total = useMemo(() => {
    const updatedTotal = selectedTokens.reduce((total, token) => {
      if (token?.market?.floorAsk?.price?.amount?.decimal) {
        if (isChainCurrency) {
          total +=
            token.market.floorAsk.price.amount.native || // native price is null for tokens with dynamic pricing
            token.market.floorAsk.price.amount.decimal
        } else {
          total += token.market.floorAsk.price.amount.decimal
        }
      }

      return total
    }, 0)
    return updatedTotal
  }, [selectedTokens, isChainCurrency])

  const coinConversion = useCoinConversion(
    open && currency ? 'USD' : undefined,
    currency?.symbol
  )
  const usdPrice =
    coinConversion !== undefined && coinConversion !== null
      ? Number(coinConversion)
      : 0
  const totalUsd = usdPrice * (total || 0)

  const { data: balance } = useBalance({
    chainId: chain?.id,
    address: account.address,
    token:
      currency?.address !== zeroAddress
        ? (currency?.address as UseBalanceToken)
        : undefined,
    watch: open,
    formatUnits: currency?.decimals,
  })

  // Determine if user has enough funds
  useEffect(() => {
    if (balance) {
      const totalPriceTruncated = toFixed(total, currency?.decimals || 18)
      if (!balance.value) {
        setHasEnoughCurrency(false)
      } else if (
        balance?.value <
        parseUnits(`${totalPriceTruncated as number}`, currency?.decimals)
      ) {
        setHasEnoughCurrency(false)
      } else {
        setHasEnoughCurrency(true)
      }
    }
  }, [total, balance, currency])

  // Update currency
  const updateCurrency = useCallback(
    (tokens: Token[]) => {
      let currencies = new Set<string>()
      let currenciesData: Record<string, Currency> = {}
      for (let i = 0; i < tokens.length; i++) {
        const currency = tokens[i]?.market?.floorAsk?.price?.currency
        if (currency?.contract) {
          currencies.add(currency.contract)
          currenciesData[currency.contract] = currency
        }
        if (currencies.size > 1) {
          break
        }
      }
      if (currencies.size > 1) {
        return setCurrency(chainCurrency)
      } else if (currencies.size > 0) {
        let otherCurrency = Object.values(currenciesData)[0]
        return setCurrency({
          name: otherCurrency?.name as string,
          symbol: otherCurrency?.symbol as string,
          decimals: otherCurrency?.decimals as number,
          address: otherCurrency?.contract as Address,
          chainId: chain?.id as number,
        })
      }
    },
    [chain, chainCurrency]
  )

  // update currency based on selected tokens
  useEffect(() => {
    updateCurrency(selectedTokens)
  }, [selectedTokens])

  const availableTokens = useMemo(() => {
    if (!tokens) return []
    return tokens.filter(
      (token) =>
        token !== undefined &&
        token?.token !== undefined &&
        token?.market?.floorAsk?.price !== undefined &&
        token?.market?.floorAsk?.price?.amount?.decimal !== undefined &&
        token?.token?.owner?.toLowerCase() !== account?.address?.toLowerCase()
    )
  }, [tokens, account])

  const cheapestAvailablePrice =
    availableTokens?.[0]?.market?.floorAsk?.price?.amount?.native || 0

  useEffect(() => {
    setItemAmount(1)
    setEthAmount(cheapestAvailablePrice)
  }, [availableTokens.length])

  // set max input
  useEffect(() => {
    if (isItemsToggled) {
      setMaxInput(Math.min(availableTokens.length, 50))
    } else {
      const maxEth = availableTokens.slice(0, 50).reduce((total, token) => {
        if (token?.market?.floorAsk?.price?.amount?.decimal) {
          if (isChainCurrency) {
            total +=
              token.market.floorAsk.price.amount.native || // native price is null for tokens with dynamic pricing
              token.market.floorAsk.price.amount.decimal
          } else {
            total += token.market.floorAsk.price.amount.decimal
          }
        }

        return total
      }, 0)

      setMaxInput(maxEth)
    }
  }, [availableTokens, isItemsToggled])

  // sort tokens by price
  const sortByPrice = useCallback((a: Token, b: Token) => {
    const aPrice = a.market?.floorAsk?.price?.amount?.decimal
    const bPrice = b.market?.floorAsk?.price?.amount?.decimal

    if (aPrice === undefined) {
      return 1
    } else if (bPrice === undefined) {
      return -1
    } else {
      return aPrice - bPrice
    }
  }, [])

  const updateSelectedTokens = useCallback(
    (tokens: Token[], maxTokens: number) => {
      let pools: { [poolId: string]: number } = {}
      let updatedTokens: Token[] = []

      // Create a copy of the availableTokens
      let processedTokens = [...tokens]
      let total = 0

      for (let i = 0; i < maxTokens && i < processedTokens.length; i++) {
        const token = processedTokens[i]

        const tokenPrice = isChainCurrency
          ? token.market?.floorAsk?.price?.amount?.native || // native price is null for tokens with dynamic pricing
            token.market?.floorAsk?.price?.amount?.decimal ||
            0
          : token.market?.floorAsk?.price?.amount?.decimal || 0

        if (isItemsToggled) {
          updatedTokens.push(token)
        } else if (ethAmount && tokenPrice + total <= ethAmount) {
          total += tokenPrice
          updatedTokens.push(token)
        } else {
          break
        }

        // handle if token is in a dynamic pricing pool
        if (
          token.market?.floorAsk?.dynamicPricing?.kind === 'pool' &&
          token?.market?.floorAsk?.dynamicPricing?.data?.pool &&
          token?.market?.floorAsk?.dynamicPricing?.data?.prices
        ) {
          const poolId = token.market.floorAsk.dynamicPricing.data
            .pool as string
          const poolPrices = token.market.floorAsk.dynamicPricing.data
            .prices as FloorAskPrice[]

          // update the pools
          if (pools[poolId] === undefined) {
            pools[poolId] = 1
          } else {
            pools[poolId] += 1
          }

          // update the prices of other tokens in the same pool
          processedTokens = processedTokens.map((processedToken) => {
            if (
              processedToken.market?.floorAsk?.dynamicPricing?.data?.pool ===
                poolId &&
              !updatedTokens.some(
                (updatedToken) =>
                  updatedToken.token?.tokenId === processedToken.token?.tokenId
              )
            ) {
              if (pools[poolId] < poolPrices.length) {
                processedToken.market.floorAsk.price = poolPrices[pools[poolId]]
              } else {
                processedToken.market.floorAsk.price = undefined
              }
            }
            return processedToken
          })

          // sort tokens with the updated prices
          processedTokens.sort(sortByPrice)
        }
      }

      return updatedTokens
    },
    [sortByPrice, isItemsToggled, ethAmount, isChainCurrency]
  )

  useEffect(() => {
    if (isItemsToggled) {
      const updatedTokens = updateSelectedTokens(
        availableTokens,
        itemAmount || 0
      )
      setSelectedTokens(updatedTokens)
    } else {
      const updatedTokens = updateSelectedTokens(availableTokens, 50)
      setSelectedTokens(updatedTokens)
    }
  }, [isItemsToggled, ethAmount, itemAmount, updateSelectedTokens])

  // reset selectedItems when toggle changes
  useEffect(() => {
    setItemAmount(1)
    setEthAmount(cheapestAvailablePrice)
  }, [isItemsToggled])

  // reset state on close
  useEffect(() => {
    if (!open) {
      setSelectedTokens([])
      setItemAmount(undefined)
      setEthAmount(undefined)
      setSweepStep(SweepStep.Idle)
      setIsItemsToggled(true)
      setTransactionError(null)
    }
  }, [open])

  const sweepTokens = useCallback(() => {
    if (!signer) {
      const error = new Error('Missing a signer')
      setTransactionError(error)
      throw error
    }

    if (!client) {
      const error = new Error('ReservoirClient was not initialized')
      setTransactionError(error)
      throw error
    }

    setTransactionError(null)

    let options: BuyTokenOptions = {
      partial: true,
    }

    if (referrer && referrerFeeBps) {
      const price = toFixed(total, currency?.decimals || 18)
      const fee =
        (Number(parseUnits(`${Number(price)}`, currency?.decimals)) *
          referrerFeeBps) /
        10000
      const atomicUnitsFee = formatUnits(BigInt(fee), 0)
      options.feesOnTop = [`${referrer}:${atomicUnitsFee}`]
    } else if (referrer && referrerFeeFixed) {
      options.feesOnTop = [`${referrer}:${referrerFeeFixed}`]
    } else if (referrer === null && referrerFeeBps === null) {
      delete options.feesOnTop
    }

    if (normalizeRoyalties !== undefined) {
      options.normalizeRoyalties = normalizeRoyalties
    }

    const items = selectedTokens.reduce((items, token) => {
      if (token?.token?.tokenId && token?.token?.contract) {
        items?.push({
          token: `${token.token.contract}:${token.token.tokenId}`,
        })
      }
      return items
    }, [] as Parameters<ReservoirClientActions['buyToken']>['0']['items'])

    if (!items || items.length === 0) {
      const error = new Error('No tokens to sweep')
      setTransactionError(error)
      throw error
    }

    setSweepStep(SweepStep.Approving)

    client.actions
      .buyToken({
        items: items,
        expectedPrice: total,
        signer,
        options,
        onProgress: (steps: Execute['steps'], path: Execute['path']) => {
          if (!steps) {
            return
          }

          const executableSteps = steps.filter(
            (step) => step.items && step.items.length > 0
          )

          let stepCount = executableSteps.length

          let currentStepItem:
            | NonNullable<Execute['steps'][0]['items']>[0]
            | undefined

          const currentStepIndex = executableSteps.findIndex((step) => {
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
              stepProgress: currentStepIndex,
              currentStep,
              currentStepItem,
              path: path,
            })
          }

          if (currentStep.items?.every((item) => item.txHash)) {
            setSweepStep(SweepStep.Finalizing)
          }

          if (
            steps.every(
              (step) =>
                !step.items ||
                step.items.length == 0 ||
                step.items?.every((item) => item.status === 'complete')
            )
          ) {
            setSweepStep(SweepStep.Complete)
          }
        },
      })
      .catch((e: any) => {
        const error = e as Error
        const transactionError = new Error(error?.message || '', {
          cause: error,
        })
        setTransactionError(transactionError)
        setSweepStep(SweepStep.Idle)
        mutateTokens()
      })
  }, [
    selectedTokens,
    client,
    signer,
    total,
    normalizeRoyalties,
    chain,
    collectionId,
    currency,
  ])

  return (
    <>
      {children({
        loading: fetchingTokens,
        address: account?.address,
        selectedTokens,
        setSelectedTokens,
        itemAmount,
        setItemAmount,
        ethAmount,
        setEthAmount,
        isItemsToggled,
        setIsItemsToggled,
        maxInput,
        setMaxInput,
        currency,
        isChainCurrency,
        total,
        totalUsd,
        currentChain,
        availableTokens,
        tokens,
        balance: balance?.value,
        hasEnoughCurrency,
        blockExplorerBaseUrl,
        transactionError,
        stepData,
        setStepData,
        sweepStep,
        setSweepStep,
        sweepTokens,
      })}
    </>
  )
}
