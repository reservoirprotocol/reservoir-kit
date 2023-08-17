import React, { FC, ReactNode, useCallback, useEffect, useState } from 'react'
import {
  useChainCurrency,
  useCollections,
  useCurrencyConversion,
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
import { BuyResponses } from '@reservoir0x/reservoir-sdk/src/types'

export enum CollectStep {
  Idle,
  Approving,
  Finalizing,
  Complete,
}

export type CollectModalStepData = {
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

export type CollectModalMode = 'preferMint' | 'mint' | 'trade'

export type CollectModalContentMode = 'mint' | 'sweep'

export type ChildrenProps = {
  contentMode?: CollectModalContentMode
  collection?: NonNullable<ReturnType<typeof useCollections>['data']>[0]
  token?: NonNullable<ReturnType<typeof useTokens>['data']>[0]
  loading: boolean
  orders: NonNullable<BuyPath>
  selectedTokens: NonNullable<BuyPath>
  setSelectedTokens: React.Dispatch<React.SetStateAction<NonNullable<BuyPath>>>
  itemAmount: number
  setItemAmount: React.Dispatch<React.SetStateAction<number>>
  maxItemAmount: number
  setMaxItemAmount: React.Dispatch<React.SetStateAction<number>>
  currency: ReturnType<typeof useChainCurrency>
  chainCurrency: ReturnType<typeof useChainCurrency>
  isChainCurrency: boolean
  total: number
  totalIncludingFees: number
  totalUsd: number
  feeOnTop: number
  feeUsd: number
  usdPrice: number
  mintPrice: number
  currentChain: ReservoirChain | null | undefined
  address?: string
  balance?: bigint
  contract: Address
  hasEnoughCurrency: boolean
  addFundsLink: string
  blockExplorerBaseUrl: string
  transactionError: Error | null | undefined
  stepData: CollectModalStepData | null
  setStepData: React.Dispatch<React.SetStateAction<CollectModalStepData | null>>
  collectStep: CollectStep
  setCollectStep: React.Dispatch<React.SetStateAction<CollectStep>>
  collectTokens: () => void
}

type Props = {
  open: boolean
  mode?: CollectModalMode
  collectionId?: string
  tokenId?: string
  feesOnTopBps?: string[] | null
  feesOnTopUsd?: string[] | null
  normalizeRoyalties?: boolean
  children: (props: ChildrenProps) => ReactNode
}

export const CollectModalRenderer: FC<Props> = ({
  open,
  mode = 'preferMint',
  collectionId,
  tokenId,
  feesOnTopBps,
  feesOnTopUsd,
  normalizeRoyalties,
  children,
}) => {
  const { data: wallet } = useWalletClient()
  const account = useAccount()
  const [selectedTokens, setSelectedTokens] = useState<NonNullable<BuyPath>>([])
  const [fetchedInitialOrders, setFetchedInitialOrders] = useState(false)
  const [orders, setOrders] = useState<NonNullable<BuyPath>>([])
  const [itemAmount, setItemAmount] = useState<number>(1)
  const [maxItemAmount, setMaxItemAmount] = useState<number>(1)
  const [collectStep, setCollectStep] = useState<CollectStep>(CollectStep.Idle)
  const [stepData, setStepData] = useState<CollectModalStepData | null>(null)
  const [transactionError, setTransactionError] = useState<Error | null>()
  const [total, setTotal] = useState(0)
  const [totalIncludingFees, setTotalIncludingFees] = useState(0)

  const [contentMode, setContentMode] = useState<
    CollectModalContentMode | undefined
  >(() => {
    switch (mode) {
      case 'mint':
        return 'mint'
      case 'trade':
        return 'sweep'
      case 'preferMint':
      default:
        return undefined
    }
  })

  const mintPrice = orders?.[0]?.totalPrice || 0

  const [hasEnoughCurrency, setHasEnoughCurrency] = useState(true)
  const [feeOnTop, setFeeOnTop] = useState(0)

  const chainCurrency = useChainCurrency()
  const [currency, setCurrency] = useState(chainCurrency)

  const isChainCurrency = currency.address === chainCurrency.address

  const client = useReservoirClient()
  const currentChain = client?.currentChain()

  const contract = collectionId?.split(':')[0] as Address

  const { chains } = useNetwork()
  const chain = chains.find((chain) => chain.id === currentChain?.id)

  const blockExplorerBaseUrl =
    chain?.blockExplorers?.default?.url || 'https://etherscan.io'

  const addFundsLink = currency?.address
    ? `https://jumper.exchange/?toChain=${chain?.id}&toToken=${currency?.address}`
    : `https://jumper.exchange/?toChain=${chain?.id}`

  const { data: collections, mutate: mutateCollection } = useCollections(
    open && {
      id: collectionId,
      includeMintStages: true,
    }
  )

  const collection = collections && collections[0] ? collections[0] : undefined

  const is1155 = collection?.contractKind === 'erc1155'
  const isSingleToken1155 = is1155 && collection?.tokenCount === '1'

  const { data: tokens } = useTokens(
    open && (tokenId || isSingleToken1155)
      ? {
          collection: isSingleToken1155 ? collectionId : undefined,
          tokens: isSingleToken1155 ? undefined : `${collectionId}:${tokenId}`,
        }
      : undefined
  )

  const token = tokens && tokens[0] ? tokens[0] : undefined

  const { data: usdFeeConversion } = useCurrencyConversion(
    undefined,
    currency?.address,
    'usd'
  )
  const usdPrice = Number(usdFeeConversion?.usd || 0)
  const feeUsd = feeOnTop * usdPrice
  const totalUsd = usdPrice * (totalIncludingFees || 0)

  const fetchBuyPath = useCallback(() => {
    if (!wallet || !client) {
      return
    }

    let options: BuyTokenOptions = {
      partial: true,
      onlyPath: true,
    }

    if (normalizeRoyalties !== undefined) {
      options.normalizeRoyalties = normalizeRoyalties
    }

    client?.actions
      .buyToken({
        items: [
          {
            collection: token?.token?.tokenId ? undefined : collectionId,
            token: token?.token?.tokenId
              ? `${collectionId}:${token?.token?.tokenId}`
              : undefined,
            fillType: mode === 'preferMint' ? undefined : mode,
          },
        ],
        expectedPrice: undefined,
        options,
        wallet,
        precheck: true,
        onProgress: () => {},
      })
      .then((rawData) => {
        let data = rawData as BuyResponses

        let intendedContentMode =
          mode === 'mint' ? 'mint' : ('sweep' as CollectModalContentMode)

        if ('path' in data) {
          let pathData = data['path']
          setOrders(pathData ?? [])

          // handle setting max quantity
          if ('maxQuantities' in data && data.maxQuantities?.[0]) {
            if (is1155) {
              let totalMaxQuantity = data.maxQuantities.reduce(
                (total, currentQuantity) =>
                  total + Number(currentQuantity.maxQuantity),
                0
              )
              setMaxItemAmount(totalMaxQuantity)
            } else {
              let maxQuantity = data.maxQuantities?.[0].maxQuantity
              setMaxItemAmount(maxQuantity ? Number(maxQuantity) : 50) // if value is null/undefined, we don't know max quantity, so set it to 50
            }
          } else {
            setMaxItemAmount(0)
          }

          if (mode === 'preferMint') {
            // check if the path data includes any mints
            if (
              pathData?.find((order) => order.orderId?.includes('mint')) !=
              undefined
            ) {
              intendedContentMode = 'mint'
            }
          }
        }

        setContentMode(intendedContentMode)
      })
      .catch(() => {
        setContentMode(mode === 'mint' ? 'mint' : 'sweep')
      })
      .finally(() => {
        setFetchedInitialOrders(true)
      })
  }, [
    client,
    wallet,
    normalizeRoyalties,
    collectionId,
    tokenId,
    currency,
    mode,
    token?.token?.tokenId,
    is1155,
  ])

  const fetchBuyPathIfIdle = useCallback(() => {
    if (collectStep === CollectStep.Idle) {
      fetchBuyPath()
    }
  }, [fetchBuyPath, collectStep])

  useEffect(() => {
    if (open) {
      fetchBuyPathIfIdle()

      if (contentMode === 'sweep') {
        const intervalId = setInterval(fetchBuyPathIfIdle, 60000) // Poll buy api every 1 minute
        return () => clearInterval(intervalId)
      }
    }
  }, [client, wallet, open, fetchBuyPathIfIdle, token?.token?.tokenId, is1155])

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
            name: '',
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

  const calculateFees = useCallback(
    (totalPrice: number) => {
      let fees = 0
      if (feesOnTopBps && feesOnTopBps.length > 0) {
        fees = feesOnTopBps.reduce((totalFees, feeOnTop) => {
          const [_, fee] = feeOnTop.split(':')
          return totalFees + (Number(fee) / 10000) * totalPrice
        }, 0)
      } else if (feesOnTopUsd && feesOnTopUsd.length > 0 && usdPrice) {
        fees = feesOnTopUsd.reduce((totalFees, feeOnTop) => {
          const [_, fee] = feeOnTop.split(':')
          const atomicUsdPrice = parseUnits(`${usdPrice}`, 6)
          const atomicFee = BigInt(fee)
          const convertedAtomicFee =
            atomicFee * BigInt(10 ** currency?.decimals!)
          const currencyFee = convertedAtomicFee / atomicUsdPrice
          const parsedFee = formatUnits(currencyFee, currency?.decimals || 18)
          return totalFees + Number(parsedFee)
        }, 0)
      }

      return fees
    },
    [feesOnTopBps, feeOnTop, usdPrice, feesOnTopUsd, currency]
  )

  useEffect(() => {
    let updatedTotal = 0
    // Mint erc1155
    if (contentMode === 'mint' && is1155) {
      let remainingQuantity = itemAmount

      for (const order of orders) {
        if (remainingQuantity >= 0) {
          let orderQuantity = order?.quantity || 1
          let orderPricePerItem = order?.totalPrice || 0

          if (remainingQuantity >= orderQuantity) {
            updatedTotal += orderPricePerItem * orderQuantity
            remainingQuantity -= orderQuantity
          } else {
            let fractionalPrice = orderPricePerItem * remainingQuantity
            updatedTotal += fractionalPrice
            remainingQuantity = 0
          }
        }
      }
    }

    // Mint erc721
    else if (contentMode === 'mint') {
      updatedTotal = mintPrice * (Math.max(0, itemAmount) || 0)
    }

    // Sweep erc1155
    else if (is1155) {
      let remainingQuantity = itemAmount

      for (const order of orders) {
        if (remainingQuantity <= 0) {
          break
        }
        let orderQuantity = order?.quantity || 1
        let orderPricePerItem = order?.totalPrice || 0

        if (remainingQuantity >= orderQuantity) {
          updatedTotal += orderPricePerItem * orderQuantity
          remainingQuantity -= orderQuantity
        } else {
          let fractionalPrice = orderPricePerItem * remainingQuantity
          updatedTotal += fractionalPrice
          remainingQuantity = 0
        }
      }
    }
    // Sweep erc721
    else {
      updatedTotal = selectedTokens?.reduce((total, token) => {
        return (
          total +
          (token?.currency != chainCurrency.address && isChainCurrency
            ? token?.buyInQuote || 0
            : token?.totalPrice || 0)
        )
      }, 0)
    }
    const fees = calculateFees(updatedTotal)
    setFeeOnTop(fees)
    setTotal(updatedTotal)
    setTotalIncludingFees(updatedTotal + fees)
  }, [
    selectedTokens,
    feesOnTopBps,
    feesOnTopUsd,
    currency,
    isChainCurrency,
    contentMode,
    itemAmount,
    orders,
  ])

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

  useEffect(() => {
    if (contentMode === 'sweep') {
      const updatedTokens = orders?.slice(0, Math.max(0, itemAmount))
      setSelectedTokens(updatedTokens)
    }
  }, [itemAmount, orders])

  // Reset state on close
  useEffect(() => {
    if (!open) {
      setSelectedTokens([])
      setOrders([])
      setItemAmount(1)
      setMaxItemAmount(1)
      setCollectStep(CollectStep.Idle)
      setContentMode(undefined)
      setTransactionError(null)
      setFetchedInitialOrders(false)
    }
  }, [open])

  const collectTokens = useCallback(() => {
    if (!wallet) {
      const error = new Error('Missing a wallet/signer')
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
      currency: currency?.address,
    }

    if (feesOnTopBps && feesOnTopBps?.length > 0) {
      const fixedFees = feesOnTopBps.map((fullFee) => {
        const [referrer, feeBps] = fullFee.split(':')
        const totalFeeTruncated = toFixed(
          total - feeOnTop,
          currency?.decimals || 18
        )
        const fee =
          Number(
            parseUnits(
              `${Number(totalFeeTruncated)}`,
              currency?.decimals || 18
            ) * BigInt(feeBps)
          ) / 10000
        const atomicUnitsFee = formatUnits(BigInt(fee), 0)
        return `${referrer}:${atomicUnitsFee}`
      })
      options.feesOnTop = fixedFees
    } else if (feesOnTopUsd && feesOnTopUsd.length > 0 && usdPrice) {
      const feesOnTopFixed = feesOnTopUsd.map((feeOnTop) => {
        const [recipient, fee] = feeOnTop.split(':')
        const atomicUsdPrice = parseUnits(`${usdPrice}`, 6)
        const atomicFee = BigInt(fee)
        const convertedAtomicFee = atomicFee * BigInt(10 ** currency?.decimals!)
        const currencyFee = convertedAtomicFee / atomicUsdPrice
        const parsedFee = formatUnits(currencyFee, 0)
        return `${recipient}:${parsedFee}`
      })
      options.feesOnTop = feesOnTopFixed
    } else if (!feesOnTopUsd && !feesOnTopBps) {
      delete options.feesOnTop
    }

    if (normalizeRoyalties !== undefined) {
      options.normalizeRoyalties = normalizeRoyalties
    }

    setCollectStep(CollectStep.Approving)

    client.actions
      .buyToken({
        items: [
          {
            collection: token?.token?.tokenId ? undefined : collectionId,
            token: token?.token?.tokenId
              ? `${collectionId}:${token?.token?.tokenId}`
              : undefined,
            quantity: itemAmount,
            fillType: contentMode === 'mint' ? 'mint' : 'trade',
          },
        ],
        expectedPrice: {
          [currency?.address || zeroAddress]: {
            amount: total,
            raw: parseUnits(`${total}`, currency.decimals),
            currencyAddress: currency.address,
            currencyDecimals: currency.decimals,
          },
        },
        wallet,
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
            setCollectStep(CollectStep.Finalizing)
          }

          if (
            steps.every(
              (step) =>
                !step.items ||
                step.items.length == 0 ||
                step.items?.every((item) => item.status === 'complete')
            )
          ) {
            setCollectStep(CollectStep.Complete)
          }
        },
      })
      .catch((e: any) => {
        const error = e as Error
        //@ts-ignore
        const transactionError = new Error(error?.message || '', {
          cause: error,
        })
        setTransactionError(transactionError)
        setCollectStep(CollectStep.Idle)
        mutateCollection()
        fetchBuyPath()
      })
  }, [
    selectedTokens,
    client,
    wallet,
    total,
    normalizeRoyalties,
    chain,
    collectionId,
    tokenId,
    currency,
    feesOnTopBps,
    feesOnTopUsd,
    contentMode,
    itemAmount,
  ])

  return (
    <>
      {children({
        contentMode,
        collection,
        token,
        loading: !fetchedInitialOrders,
        address: account?.address,
        selectedTokens,
        setSelectedTokens,
        itemAmount,
        setItemAmount,
        maxItemAmount,
        setMaxItemAmount,
        currency,
        chainCurrency,
        isChainCurrency,
        total,
        totalIncludingFees,
        totalUsd,
        feeOnTop,
        feeUsd,
        usdPrice,
        currentChain,
        mintPrice,
        orders,
        balance: balance?.value,
        contract,
        hasEnoughCurrency,
        addFundsLink,
        blockExplorerBaseUrl,
        transactionError,
        stepData,
        setStepData,
        collectStep,
        setCollectStep,
        collectTokens,
      })}
    </>
  )
}
