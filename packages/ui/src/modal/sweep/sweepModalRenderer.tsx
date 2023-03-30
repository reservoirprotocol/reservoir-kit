import React, {
  FC,
  ReactNode,
  useCallback,
  useEffect,
  useState,
  useMemo,
} from 'react'
import { useChainCurrency, useTokens } from '../../hooks'
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
  const [sweepStep, setSweepStep] = useState<SweepStep>(SweepStep.Checkout)

  const currency = useChainCurrency()

  const { data: tokens } = useTokens(
    open && {
      collection: collectionId,
      normalizeRoyalties,
      limit: 100,
    }
  )

  const availableTokens = useMemo(() => {
    return tokens.filter(
      (token) =>
        token !== undefined &&
        token?.token !== undefined &&
        token?.market?.floorAsk?.price?.amount?.native !== undefined &&
        token?.market?.floorAsk?.price?.amount?.native !== null &&
        token?.market?.floorAsk?.price?.currency?.contract ===
          constants.AddressZero &&
        token?.token?.owner?.toLowerCase() !== account?.address?.toLowerCase()
    )
  }, [tokens, account])

  useEffect(() => {
    setMaxInput(availableTokens.length)
  }, [availableTokens])

  useEffect(() => {
    const sweepTokens = availableTokens.slice(0, itemAmount)
    setSelectedTokens(sweepTokens)
  }, [itemAmount])

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
        tokens,
        sweepStep,
        setSweepStep,
        sweepTokens,
      })}
    </>
  )
}
