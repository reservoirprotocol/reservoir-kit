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
import { Address, formatUnits, parseUnits, zeroAddress } from 'viem'

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

type BuyTokenOptions = Parameters<
  ReservoirClientActions['buyToken']
>['0']['options']

type Currency = NonNullable<
  NonNullable<NonNullable<Token['market']>['floorAsk']>['price']
>['currency']

type ChildrenProps = {
  loading: boolean
  selectedTokens: NonNullable<BuyPath>
  setSelectedTokens: React.Dispatch<React.SetStateAction<NonNullable<BuyPath>>>
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
  availableTokens: BuyPath
  address?: string
  tokens: BuyPath
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
  const [selectedTokens, setSelectedTokens] = useState<NonNullable<BuyPath>>([])
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

  const [fetchedInitialTokens, setFetchedInitialTokens] = useState(false)
  const [tokens, setTokens] = useState<BuyPath | undefined>(undefined)

  const fetchBuyPath = useCallback(() => {
    if (!signer || !client) {
      return
    }

    let options: BuyTokenOptions = {
      // partial: true,
      // onlyPath: true,
      // currency: currency.address,
    }

    if (normalizeRoyalties !== undefined) {
      options.normalizeRoyalties = normalizeRoyalties
    }

    client?.actions
      .buyToken({
        items: [{ collection: collectionId, quantity: 100 }],
        expectedPrice: undefined,
        options,
        signer: signer,
        precheck: true,
        onProgress: () => {},
      })
      .then((data) => {
        setTokens(
          'path' in (data as any)
            ? ((data as Execute)['path'] as BuyPath)
            : undefined
        )
      })
      .finally(() => {
        setFetchedInitialTokens(true)
      })
  }, [client, signer, normalizeRoyalties, collectionId, currency])

  useEffect(() => {
    if (open) {
      fetchBuyPath()
    }
  }, [client, signer, open, currency])

  // Update currency
  const updateCurrency = useCallback(
    (tokens: typeof selectedTokens) => {
      let currencies = new Set<string>()
      let currenciesData: Record<string, Currency> = {}
      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i]
        if (token.currency) {
          currencies.add(token.currency)
          currenciesData[token.currency] = {
            contract: token.currency,
            symbol: token.currencySymbol,
            decimals: token.currencyDecimals,
          }
        }
        if (currencies.size > 1) {
          break
        }
      }
      if (currencies.size > 1) {
        if (currency?.address != chainCurrency?.address) {
          setCurrency(chainCurrency)
        }
      } else if (currencies.size > 0) {
        let otherCurrency = Object.values(currenciesData)[0]
        if (otherCurrency?.contract != currency?.address) {
          setCurrency({
            symbol: otherCurrency?.symbol as string,
            decimals: otherCurrency?.decimals as number,
            name: '', // TODO: fix
            address: otherCurrency?.contract as Address,
            chainId: chain?.id as number,
          })
        }
      }
    },
    [chain, chainCurrency]
  )

  // update currency based on selected tokens
  useEffect(() => {
    updateCurrency(selectedTokens)
  }, [selectedTokens])

  const total = useMemo(() => {
    const updatedTotal = selectedTokens?.reduce((total, token) => {
      total += token?.totalPrice || 0
      return total
    }, 0)
    return updatedTotal
  }, [selectedTokens, isChainCurrency])

  const coinConversion = useCoinConversion(
    open && currency ? 'USD' : undefined,
    currency?.symbol
  )
  const usdPrice = coinConversion.length > 0 ? coinConversion[0].price : 0
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
        parseUnits(`${totalPriceTruncated as number}`, currency?.decimals || 18)
      ) {
        setHasEnoughCurrency(false)
      } else {
        setHasEnoughCurrency(true)
      }
    }
  }, [total, balance, currency])

  const availableTokens = useMemo(() => {
    if (!tokens) return []
    return tokens
  }, [tokens, account])

  const cheapestAvailablePrice = availableTokens?.[0]?.totalPrice || 0

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
        total += token?.totalPrice || 0

        return total
      }, 0)

      setMaxInput(maxEth)
    }
  }, [availableTokens, isItemsToggled])

  const calculateTokensToAdd = useCallback(() => {
    let totalEthPrice = 0
    let tokensToAdd = []
    for (let token of availableTokens) {
      if (
        ethAmount &&
        totalEthPrice + (token?.totalPrice || 0) <= ethAmount &&
        tokensToAdd.length < 50
      ) {
        totalEthPrice += token?.totalPrice || 0
        tokensToAdd.push(token)
      } else {
        break
      }
    }
    return tokensToAdd
  }, [availableTokens, ethAmount])

  useEffect(() => {
    if (isItemsToggled) {
      const updatedTokens = availableTokens?.slice(0, itemAmount)
      setSelectedTokens(updatedTokens)
    } else {
      setSelectedTokens(calculateTokensToAdd())
    }
  }, [isItemsToggled, ethAmount, itemAmount])

  // reset selectedItems when toggle changes
  useEffect(() => {
    setItemAmount(1)
    setEthAmount(cheapestAvailablePrice)
  }, [isItemsToggled])

  // reset state on close
  useEffect(() => {
    if (!open) {
      setSelectedTokens([])
      setTokens(undefined)
      setItemAmount(undefined)
      setEthAmount(undefined)
      setSweepStep(SweepStep.Idle)
      setIsItemsToggled(true)
      setTransactionError(null)
      setFetchedInitialTokens(false)
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
        (Number(parseUnits(`${Number(price)}`, currency?.decimals || 18)) *
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

    if (!selectedTokens || selectedTokens.length === 0) {
      const error = new Error('No tokens to sweep')
      setTransactionError(error)
      throw error
    }

    setSweepStep(SweepStep.Approving)

    client.actions
      .buyToken({
        items: [{ collection: collectionId, quantity: selectedTokens.length }],
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
        fetchBuyPath()
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
        loading: !fetchedInitialTokens,
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
