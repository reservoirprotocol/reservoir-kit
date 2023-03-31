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

export enum SweepStep {
  Checkout,
  Approving,
  AddFunds,
  Complete,
  Unavailable,
}

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

  const {
    data: tokens,
    hasNextPage,
    fetchNextPage,
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
        // token?.market?.floorAsk?.price?.amount?.native !== undefined &&
        // token?.market?.floorAsk?.price?.amount?.native !== null &&
        token?.market?.floorAsk?.price?.currency?.contract ===
          constants.AddressZero &&
        token?.token?.owner?.toLowerCase() !==
          account?.address?.toLowerCase() &&
        token?.market.floorAsk.dynamicPricing?.data.pool ==
          '0x213a5df4ed3d596f2ca0c7f603a68125db7dbd9e'
    )
  }, [tokens, account])

  useEffect(() => {
    setMaxInput(availableTokens.length)

    const total = selectedTokens.reduce((total, token) => {
      if (token?.market?.floorAsk?.price?.amount?.native) {
        total += token.market.floorAsk.price.amount.native
      }
      return total
    }, 0)

    setTotal(total)
  }, [availableTokens])

  useEffect(() => {
    let pools: { [poolId: string]: number } = {}
    let updatedTokens: ReturnType<typeof useTokens>['data'] = []

    for (let i = 0; i < itemAmount && i < availableTokens.length; i++) {
      const token = availableTokens[i]

      // handle dynamic pricing
      if (
        token.market?.floorAsk?.dynamicPricing?.kind === 'pool' &&
        token?.market?.floorAsk?.dynamicPricing?.data?.pool &&
        token?.market?.floorAsk?.dynamicPricing?.data?.prices
      ) {
        const poolId = token.market.floorAsk.dynamicPricing.data.pool as string
        const poolPrices = token.market.floorAsk.dynamicPricing.data.prices

        // Update the price based on the pool position
        if (pools[poolId] === undefined) {
          pools[poolId] = 0
        } else {
          pools[poolId] += 1
        }

        if (pools[poolId] < poolPrices.length) {
          token.market.floorAsk.price = poolPrices[pools[poolId]]
        } else {
          token.market.floorAsk.price = undefined
        }
        // Sort the updated tokens by price
        updatedTokens.sort((a, b) => {
          const aPrice = a.market?.floorAsk?.price?.amount?.decimal
          const bPrice = b.market?.floorAsk?.price?.amount?.decimal

          if (aPrice === undefined) {
            return 1
          } else if (bPrice === undefined) {
            return -1
          } else {
            return aPrice - bPrice
          }
        })
      }

      updatedTokens.push(token)
    }
    console.log('Available tokens: ', availableTokens)
    console.log('Pools: ', pools)
    console.log('Updated tokens: ', updatedTokens)

    setSelectedTokens(updatedTokens)
  }, [itemAmount])

  useEffect(() => {}, [ethAmount])

  useEffect(() => {
    setItemAmount(0)
    setEthAmount(0)
  }, [isItemsToggled])

  // fetch more tokens if less than 50 available // todo: check if listed
  // useEffect(() => {
  //   if (availableTokens && availableTokens.length < 50 && hasNextPage) {
  //     console.log(availableTokens)
  //     fetchNextPage()
  //   }
  // }, [availableTokens])

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
