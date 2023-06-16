import React, {
  FC,
  ReactNode,
  useCallback,
  useEffect,
  useState,
  useMemo,
} from 'react'
import {
  useCoinConversion,
  useCollections,
  useReservoirClient,
  useTokens,
} from '../../hooks'
import { useAccount, useBalance, useNetwork, useWalletClient } from 'wagmi'
import Token from '../list/Token'
import {
  BuyPath,
  Execute,
  ReservoirChain,
  ReservoirClientActions,
} from '@reservoir0x/reservoir-sdk'
import { toFixed } from '../../lib/numbers'
import { UseBalanceToken } from '../../types/wagmi'
import { formatUnits, parseUnits, zeroAddress } from 'viem'

export enum MintStep {
  Idle,
  AddFunds,
  Approving,
  Finalizing,
  Complete,
}

export type MintModalStepData = {
  totalSteps: number
  stepProgress: number
  currentStep: Execute['steps'][0]
  currentStepItem: NonNullable<Execute['steps'][0]['items']>[0]
  path: Execute['path']
}

type Token = ReturnType<typeof useTokens>['data'][0]

type BuyTokenOptions = Parameters<
  ReservoirClientActions['buyToken']
>['0']['options']

export type MintCurrency = NonNullable<
  NonNullable<NonNullable<Token['market']>['floorAsk']>['price']
>['currency']

type ChildrenProps = {
  loading: boolean
  collection?: NonNullable<ReturnType<typeof useCollections>['data']>[0]
  quantity: number
  setQuantity: React.Dispatch<React.SetStateAction<number>>
  maxQuantity: number
  setMaxQuantity: React.Dispatch<React.SetStateAction<number>>
  currency?: MintCurrency
  total: number
  totalUsd: number
  usdPrice: number
  currentChain: ReservoirChain | null | undefined
  address?: string
  mintData: BuyPath
  mintPrice: number
  balance?: bigint
  hasEnoughCurrency: boolean
  blockExplorerBaseUrl: string
  transactionError: Error | null | undefined
  stepData: MintModalStepData | null
  setStepData: React.Dispatch<React.SetStateAction<MintModalStepData | null>>
  mintStep: MintStep
  setMintStep: React.Dispatch<React.SetStateAction<MintStep>>
  mintTokens: () => void
}

type Props = {
  open: boolean
  collectionId?: string
  children: (props: ChildrenProps) => ReactNode
}

export const MintModalRenderer: FC<Props> = ({
  open,
  collectionId,
  children,
}) => {
  const { data: signer } = useWalletClient()
  const account = useAccount()
  const [mintData, setMintData] = useState<BuyPath | undefined>(undefined)
  const [quantity, setQuantity] = useState(1)
  const [maxQuantity, setMaxQuantity] = useState<number>(50)
  const [mintStep, setMintStep] = useState<MintStep>(MintStep.Idle)
  const [stepData, setStepData] = useState<MintModalStepData | null>(null)
  const [transactionError, setTransactionError] = useState<Error | null>()

  const [hasEnoughCurrency, setHasEnoughCurrency] = useState(true)

  const [currency, setCurrency] = useState<MintCurrency | undefined>(undefined)

  const client = useReservoirClient()
  const currentChain = client?.currentChain()

  const { chains } = useNetwork()
  const chain = chains.find((chain) => chain.id === currentChain?.id)

  const blockExplorerBaseUrl =
    chain?.blockExplorers?.default?.url || 'https://etherscan.io'

  const [fetchedInitialTokens, setFetchedInitialTokens] = useState(false)

  const mintPrice = mintData?.[0].totalPrice || 0

  const { data: collections, mutate: mutateCollection } = useCollections(
    open && {
      id: collectionId,
      includeMintStages: true,
    }
  )

  const collection = collections && collections[0] ? collections[0] : undefined

  const fetchBuyPath = useCallback(() => {
    if (!signer || !client) {
      return
    }

    let options: BuyTokenOptions = {
      partial: true,
      onlyPath: true,
    }

    client?.actions
      .buyToken({
        items: [
          {
            collection: collectionId,
            fillType: 'mint',
            quantity: 50,
          },
        ],
        expectedPrice: undefined,
        options,
        signer: signer,
        precheck: true,
        onProgress: () => {},
      })
      .then((data) => {
        if ('path' in (data as any)) {
          const buyPath = (data as Execute)['path'] as BuyPath
          setMintData(buyPath)
          setCurrency({
            contract: buyPath?.[0]?.currency,
            symbol: buyPath?.[0]?.currencySymbol,
            decimals: buyPath?.[0]?.currencyDecimals,
          })
          setMaxQuantity(buyPath?.[0]?.quantity || 50)
        }
      })
      .finally(() => {
        setFetchedInitialTokens(true)
      })
  }, [client, signer, collectionId, currency])

  useEffect(() => {
    if (open) {
      fetchBuyPath()
    }
  }, [client, signer, open])

  const total = useMemo(() => {
    const updatedTotal = mintPrice * (Math.max(0, quantity) || 0)

    return updatedTotal
  }, [mintPrice, quantity, currency])

  const coinConversion = useCoinConversion(
    open ? 'USD' : undefined,
    currency?.symbol
  )
  const usdPrice = coinConversion.length > 0 ? coinConversion[0].price : 0
  const totalUsd = usdPrice * (total || 0)

  const { data: balance } = useBalance({
    chainId: chain?.id,
    address: account.address,
    token:
      currency?.contract !== zeroAddress
        ? (currency?.contract as UseBalanceToken)
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
        parseUnits(`${totalPriceTruncated as number}`, currency?.decimals || 18)
      ) {
        setHasEnoughCurrency(false)
      } else {
        setHasEnoughCurrency(true)
      }
    }
  }, [total, balance, currency])

  // reset state on close
  useEffect(() => {
    if (!open) {
      setMintData(undefined)
      setQuantity(1)
      setMintStep(MintStep.Idle)
      setTransactionError(null)
      setFetchedInitialTokens(false)
    }
  }, [open])

  const mintTokens = useCallback(() => {
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

    if (!mintData) {
      const error = new Error('No tokens to mint')
      setTransactionError(error)
      throw error
    }

    setMintStep(MintStep.Approving)

    client.actions
      .buyToken({
        items: [
          {
            collection: collectionId,
            quantity: quantity,
            fillType: 'mint',
          },
        ],
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
            setMintStep(MintStep.Finalizing)
          }

          if (
            steps.every(
              (step) =>
                !step.items ||
                step.items.length == 0 ||
                step.items?.every((item) => item.status === 'complete')
            )
          ) {
            setMintStep(MintStep.Complete)
          }
        },
      })
      .catch((e: any) => {
        const error = e as Error
        const transactionError = new Error(error?.message || '', {
          cause: error,
        })
        setTransactionError(transactionError)
        setMintStep(MintStep.Idle)
        mutateCollection()
        fetchBuyPath()
      })
  }, [mintData, quantity, client, signer, total, chain, collectionId, currency])

  return (
    <>
      {children({
        loading: !fetchedInitialTokens || !collection,
        address: account?.address,
        collection,
        quantity,
        setQuantity,
        maxQuantity,
        setMaxQuantity,
        currency,
        total,
        totalUsd,
        usdPrice,
        currentChain,
        mintData,
        mintPrice,
        balance: balance?.value,
        hasEnoughCurrency,
        blockExplorerBaseUrl,
        transactionError,
        stepData,
        setStepData,
        mintStep,
        setMintStep,
        mintTokens,
      })}
    </>
  )
}
