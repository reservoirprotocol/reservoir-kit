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
import { constants } from 'ethers'
import { useAccount, useSigner } from 'wagmi'
import Token from '../list/Token'
import { Execute, ReservoirClientActions } from '@reservoir0x/reservoir-sdk'

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
}

type Token = ReturnType<typeof useTokens>['data'][0]

type FloorAskPrice = NonNullable<
  NonNullable<NonNullable<Token>['market']>['floorAsk']
>['price']

type BuyTokenOptions = Parameters<
  ReservoirClientActions['buyToken']
>['0']['options']

type ChildrenProps = {
  loading: boolean
  selectedTokens: ReturnType<typeof useTokens>['data']
  setSelectedTokens: React.Dispatch<
    React.SetStateAction<ReturnType<typeof useTokens>['data']>
  >
  itemAmount: number
  setItemAmount: React.Dispatch<React.SetStateAction<number>>
  ethAmount: number
  setEthAmount: React.Dispatch<React.SetStateAction<number>>
  isItemsToggled: boolean
  setIsItemsToggled: React.Dispatch<React.SetStateAction<boolean>>
  maxInput: number
  setMaxInput: React.Dispatch<React.SetStateAction<number>>
  currency: ReturnType<typeof useChainCurrency>
  total: number
  totalUsd: number
  tokens: ReturnType<typeof useTokens>['data']
  stepData: SweepModalStepData | null
  setStepData: React.Dispatch<React.SetStateAction<SweepModalStepData | null>>
  sweepStep: SweepStep
  setSweepStep: React.Dispatch<React.SetStateAction<SweepStep>>
  sweepTokens: () => void
}

type Props = {
  open: boolean
  collectionId?: string
  normalizeRoyalties?: boolean
  children: (props: ChildrenProps) => ReactNode
}

export const SweepModalRenderer: FC<Props> = ({
  open,
  collectionId,
  normalizeRoyalties,
  children,
}) => {
  const { data: signer } = useSigner()
  const account = useAccount()
  const [selectedTokens, setSelectedTokens] = useState<
    ReturnType<typeof useTokens>['data']
  >([])
  const [itemAmount, setItemAmount] = useState<number>(0)
  const [ethAmount, setEthAmount] = useState<number>(0)
  const [isItemsToggled, setIsItemsToggled] = useState<boolean>(true)
  const [maxInput, setMaxInput] = useState<number>(0)
  const [total, setTotal] = useState<number>(0)
  const [sweepStep, setSweepStep] = useState<SweepStep>(SweepStep.Idle)
  const [stepData, setStepData] = useState<SweepModalStepData | null>(null)
  const [transactionError, setTransactionError] = useState<Error | null>()

  const currency = useChainCurrency()
  const client = useReservoirClient()

  const { data: tokens, isFetchingPage } = useTokens(
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

  const coinConversion = useCoinConversion(
    open && currency ? 'USD' : undefined,
    currency?.symbol
  )
  const usdPrice =
    coinConversion !== undefined && coinConversion !== null
      ? Number(coinConversion)
      : 0
  const totalUsd = usdPrice * (total || 0)

  const availableTokens = useMemo(() => {
    return tokens.filter(
      (token) =>
        token !== undefined &&
        token?.token !== undefined &&
        token?.market?.floorAsk?.price?.currency?.contract ===
          constants.AddressZero &&
        token?.token?.owner?.toLowerCase() !== account?.address?.toLowerCase()
    )
  }, [tokens, account])

  useEffect(() => {
    setMaxInput(Math.min(availableTokens.length, isItemsToggled ? 50 : 100))
  }, [availableTokens])

  useEffect(() => {
    const total = selectedTokens.reduce((total, token) => {
      if (token?.market?.floorAsk?.price?.amount?.native) {
        total += token.market.floorAsk.price.amount.native
      }
      return total
    }, 0)

    setTotal(total)
  }, [selectedTokens])

  // Add by item
  useEffect(() => {
    let pools: { [poolId: string]: number } = {}
    let updatedTokens: Token[] = []

    // Create a copy of availableTokens
    let processedTokens = [...availableTokens]

    for (let i = 0; i < itemAmount && i < processedTokens.length; i++) {
      const token = processedTokens[i]

      updatedTokens.push(token)

      // handle if token is in a dynamic pricing pool
      if (
        token.market?.floorAsk?.dynamicPricing?.kind === 'pool' &&
        token?.market?.floorAsk?.dynamicPricing?.data?.pool &&
        token?.market?.floorAsk?.dynamicPricing?.data?.prices
      ) {
        const poolId = token.market.floorAsk.dynamicPricing.data.pool as string
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

    setSelectedTokens(updatedTokens)
  }, [itemAmount])

  // Add by price
  useEffect(() => {
    let pools: { [poolId: string]: number } = {}
    let updatedTokens: Token[] = []

    // Create a copy of the availableTokens
    let processedTokens = [...availableTokens]

    for (let i = 0; i < processedTokens.length; i++) {
      const token = processedTokens[i]

      let newTokens = [...updatedTokens, token]
      const total = newTokens.reduce((total, token) => {
        if (token?.market?.floorAsk?.price?.amount?.native) {
          total += token.market.floorAsk.price.amount.native
        }
        return total
      }, 0)
      if (total <= ethAmount && newTokens.length <= maxInput) {
        updatedTokens.push(token)
      } else {
        break
      }

      // handle dynamic pricing
      if (
        token.market?.floorAsk?.dynamicPricing?.kind === 'pool' &&
        token?.market?.floorAsk?.dynamicPricing?.data?.pool &&
        token?.market?.floorAsk?.dynamicPricing?.data?.prices
      ) {
        const poolId = token.market.floorAsk.dynamicPricing.data.pool as string
        const poolPrices = token.market.floorAsk.dynamicPricing.data
          .prices as FloorAskPrice[]

        // Update the pools
        if (pools[poolId] === undefined) {
          pools[poolId] = 1
        } else {
          pools[poolId] += 1
        }

        // Update the prices of other tokens in the same pool
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

        // Sort tokens with the updated prices
        processedTokens.sort(sortByPrice)
      }
    }

    setSelectedTokens(updatedTokens)
  }, [ethAmount])

  // reset selectedItems when toggle changes
  useEffect(() => {
    setSelectedTokens([])
    setItemAmount(0)
    setEthAmount(0)
  }, [isItemsToggled])

  // reset on close
  useEffect(() => {
    if (!open) {
      setSelectedTokens([])
      setItemAmount(0)
      setEthAmount(0)
      setMaxInput(0)
      setSweepStep(SweepStep.Idle)
      setIsItemsToggled(true)
    }
  }, [open])

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

  const sweepTokens = useCallback(async (options: BuyTokenOptions = {}) => {
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

    if (options.partial === undefined) {
      options.partial = true
    }

    setSweepStep(SweepStep.Approving)

    client.actions
      .buyToken({
        items: items,
        expectedPrice: total,
        signer,
        options,
        onProgress: (steps: Execute['steps']) => {
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

          // if (currentStep.error) {
          //   return
          // }

          if (currentStepItem) {
            setStepData({
              totalSteps: stepCount,
              stepProgress: currentStepIndex,
              currentStep,
              currentStepItem,
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
            // reset state
          }
        },
      })
      .catch((e: any) => {
        // handle errors
      })

    //
  }, [])

  return (
    <>
      {children({
        loading: isFetchingPage,
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
        total,
        totalUsd,
        tokens,
        stepData,
        setStepData,
        sweepStep,
        setSweepStep,
        sweepTokens,
      })}
    </>
  )
}
