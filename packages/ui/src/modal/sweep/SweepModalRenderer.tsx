import React, {
  FC,
  ReactNode,
  useCallback,
  useEffect,
  useState,
  useMemo,
} from 'react'
import { useChainCurrency, useCoinConversion, useTokens } from '../../hooks'
import { constants } from 'ethers'
import { useAccount } from 'wagmi'
import Token from '../list/Token'

export enum SweepStep {
  Checkout,
  Approving,
  AddFunds,
  Complete,
  Unavailable,
}

type Token = ReturnType<typeof useTokens>['data'][0]

type FloorAskPrice = NonNullable<
  NonNullable<NonNullable<Token>['market']>['floorAsk']
>['price']

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
  const account = useAccount()
  const [selectedTokens, setSelectedTokens] = useState<
    ReturnType<typeof useTokens>['data']
  >([])
  const [itemAmount, setItemAmount] = useState<number>(0)
  const [ethAmount, setEthAmount] = useState<number>(0)
  const [isItemsToggled, setIsItemsToggled] = useState<boolean>(true)
  const [maxInput, setMaxInput] = useState<number>(0)
  const [total, setTotal] = useState<number>(0)
  const [sweepStep, setSweepStep] = useState<SweepStep>(SweepStep.Checkout)

  const currency = useChainCurrency()

  const { data: tokens } = useTokens(
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
    setMaxInput(Math.min(availableTokens.length, 50))

    const total = selectedTokens.reduce((total, token) => {
      if (token?.market?.floorAsk?.price?.amount?.native) {
        total += token.market.floorAsk.price.amount.native
      }
      return total
    }, 0)

    setTotal(total)
  }, [availableTokens])

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
      if (total <= ethAmount) {
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
      setSweepStep(SweepStep.Checkout)
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

  const sweepTokens = useCallback(() => {}, [])

  return (
    <>
      {children({
        loading: !tokens,
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
        sweepStep,
        setSweepStep,
        sweepTokens,
      })}
    </>
  )
}
