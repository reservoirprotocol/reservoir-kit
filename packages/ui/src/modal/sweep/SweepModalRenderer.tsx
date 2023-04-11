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
import { useAccount, useNetwork, useSigner } from 'wagmi'
import Token from '../list/Token'
import {
  Execute,
  ReservoirChain,
  ReservoirClientActions,
} from '@reservoir0x/reservoir-sdk'

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
  currentChain: ReservoirChain | null | undefined
  tokens: ReturnType<typeof useTokens>['data']
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
  const currentChain = client?.currentChain()

  const { chains } = useNetwork()
  const chain = chains.find((chain) => chain.id === currentChain?.id)

  const blockExplorerBaseUrl =
    chain?.blockExplorers?.default?.url || 'https://etherscan.io'

  const { data: tokens, isFetchingPage: fetchingTokens } = useTokens(
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
      setSweepStep(SweepStep.Idle)
      setIsItemsToggled(true)
      setTransactionError(null)
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

    let options: BuyTokenOptions = {}

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

          // if (currentStep.error) {
          //   return
          // }

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
            setSelectedTokens([])
            setEthAmount(0)
            setItemAmount(0)
          }
        },
      })
      .catch((e: any) => {
        // handle errors
        const error = e as Error
        let message = 'Oops, something went wrong. Please try again.'
        if (error && error?.message && error?.message.includes('ETH balance')) {
          message = 'Insufficient funds'
        } else {
          const errorType = (error as any)?.type
          const errorStatus = (error as any)?.statusCode
          if (errorType && errorType === 'price mismatch') {
            message = error.message
          }
          if (errorStatus >= 400 && errorStatus < 500) {
            message = error.message
          }
          const transactionError = new Error(message, {
            cause: error,
          })
          setTransactionError(transactionError)
          setSweepStep(SweepStep.Idle)
        }
      })

    //
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
        currentChain,
        tokens,
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
