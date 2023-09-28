import React, { FC, ReactNode, useCallback, useEffect, useState } from 'react'
import {
  useChainCurrency,
  useCollections,
  usePaymentTokens,
  useReservoirClient,
  useTokens,
} from '../../hooks'
import { useAccount, useWalletClient } from 'wagmi'
import {
  BuyPath,
  Execute,
  LogLevel,
  ReservoirChain,
  ReservoirClientActions,
} from '@reservoir0x/reservoir-sdk'
import { toFixed } from '../../lib/numbers'
import { Address, formatUnits, parseUnits, zeroAddress } from 'viem'
import { BuyResponses } from '@reservoir0x/reservoir-sdk/src/types'
import { EnhancedCurrency } from '../../hooks/usePaymentTokens'
import { getNetwork, switchNetwork } from 'wagmi/actions'
import * as allChains from 'viem/chains'
import { customChains } from '@reservoir0x/reservoir-sdk'

export enum CollectStep {
  Idle,
  SelectPayment,
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

type BuyTokenOptions = Parameters<
  ReservoirClientActions['buyToken']
>['0']['options']

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
  paymentCurrency?: EnhancedCurrency
  setPaymentCurrency: React.Dispatch<
    React.SetStateAction<EnhancedCurrency | undefined>
  >
  chainCurrency: ReturnType<typeof useChainCurrency>
  paymentTokens: EnhancedCurrency[]
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
  isConnected: boolean
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
  onConnectWallet: () => void
  chainId?: number
  feesOnTopBps?: string[] | null
  feesOnTopUsd?: string[] | null
  normalizeRoyalties?: boolean
  children: (props: ChildrenProps) => ReactNode
}

export const CollectModalRenderer: FC<Props> = ({
  open,
  chainId,
  mode = 'preferMint',
  collectionId,
  tokenId,
  feesOnTopBps,
  feesOnTopUsd,
  onConnectWallet,
  normalizeRoyalties,
  children,
}) => {
  const client = useReservoirClient()
  const { address } = useAccount()
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

  const currentChain = client?.currentChain()

  const rendererChain = chainId
    ? client?.chains.find(({ id }) => id === chainId) || currentChain
    : currentChain

  const chainCurrency = useChainCurrency(rendererChain?.id)

  const contract = collectionId?.split(':')[0] as Address

  const wagmiChain: allChains.Chain | undefined = Object.values({
    ...allChains,
    ...customChains,
  }).find(({ id }) => rendererChain?.id === id)

  const { data: wallet } = useWalletClient({ chainId: rendererChain?.id })

  const blockExplorerBaseUrl =
    wagmiChain?.blockExplorers?.default?.url || 'https://etherscan.io'

  const { data: collections, mutate: mutateCollection } = useCollections(
    open && {
      id: collectionId,
      includeMintStages: true,
    },
    {},
    rendererChain?.id
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
      : undefined,
    {},
    rendererChain?.id
  )

  const token = tokens && tokens[0] ? tokens[0] : undefined

  const [paymentCurrency, setPaymentCurrency] = useState<
    EnhancedCurrency | undefined
  >(undefined)

  const paymentTokens = usePaymentTokens(
    open,
    address as Address,
    paymentCurrency || chainCurrency,
    totalIncludingFees,
    rendererChain?.id
  )

  const usdPrice = Number(paymentCurrency?.usdPrice || 0)
  const feeUsd = feeOnTop * usdPrice
  const totalUsd = paymentCurrency?.usdTotal || 0

  const fetchBuyPath = useCallback(() => {
    if (!client) {
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
        chainId: rendererChain?.id,
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
        wallet: {
          address: async () => {
            return address || zeroAddress
          },
        } as any,
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
      .catch((err) => {
        setContentMode(mode === 'mint' ? 'mint' : 'sweep')
        setOrders([])
        throw err
      })
      .finally(() => {
        setFetchedInitialOrders(true)
      })
  }, [
    address,
    client,
    wallet,
    rendererChain,
    normalizeRoyalties,
    collectionId,
    tokenId,
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
            atomicFee * BigInt(10 ** paymentCurrency?.decimals!)
          const currencyFee = convertedAtomicFee / atomicUsdPrice
          const parsedFee = formatUnits(
            currencyFee,
            paymentCurrency?.decimals || 18
          )
          return totalFees + Number(parsedFee)
        }, 0)
      }

      return fees
    },
    [feesOnTopBps, feeOnTop, usdPrice, feesOnTopUsd, paymentCurrency]
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
        let orderPricePerItem =
          (order?.currency?.toLowerCase() !== paymentCurrency?.address
            ? order?.buyInQuote
            : order?.totalPrice) || 0

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
          (token?.currency?.toLowerCase() != paymentCurrency?.address
            ? token?.buyInQuote || 0
            : token?.totalPrice || 0)
        )
      }, 0)
    }
    const fees = calculateFees(updatedTotal)
    setFeeOnTop(fees)
    setTotal(updatedTotal)
    setTotalIncludingFees(updatedTotal + fees)
    debugger
  }, [
    selectedTokens,
    paymentCurrency,
    feesOnTopBps,
    feesOnTopUsd,
    contentMode,
    itemAmount,
    orders,
  ])

  // Determine if user has enough funds
  useEffect(() => {
    if (!paymentTokens[0] || paymentTokens.length <= 1) {
      return
    } else if (contentMode === 'mint') {
      setPaymentCurrency(chainCurrency)
    } else if (!paymentCurrency && selectedTokens.length > 0) {
      setPaymentCurrency(
        paymentTokens.find(
          (token) => token.address === selectedTokens[0].currency?.toLowerCase()
        ) || paymentTokens[0]
      )
    }
  }, [paymentTokens, chainCurrency, selectedTokens])

  const addFundsLink = paymentCurrency?.address
    ? `https://jumper.exchange/?toChain=${rendererChain?.id}&toToken=${paymentCurrency?.address}`
    : `https://jumper.exchange/?toChain=${rendererChain?.id}`

  // Determine if user has enough funds in paymentToken
  useEffect(() => {
    if (
      paymentCurrency?.balance &&
      paymentCurrency?.currencyTotal &&
      Number(
        formatUnits(
          BigInt(paymentCurrency?.balance),
          paymentCurrency?.decimals || 18
        )
      ) >= paymentCurrency?.currencyTotal
    ) {
      setHasEnoughCurrency(true)
    } else {
      setHasEnoughCurrency(false)
    }
  }, [total, paymentCurrency])

  useEffect(() => {
    if (contentMode === 'sweep') {
      let updatedTokens = []
      let quantity = 0
      for (var i = 0; i < orders.length; i++) {
        const order = orders[i]
        if (order.quantity && order.quantity > 1) {
          quantity += order.quantity
        } else {
          quantity++
        }
        updatedTokens.push(order)
        if (quantity >= itemAmount) {
          break
        }
      }
      setSelectedTokens(updatedTokens)
    }
  }, [itemAmount, maxItemAmount, orders])

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

  const collectTokens = useCallback(async () => {
    if (!wallet) {
      onConnectWallet()
      if (document.body.style) {
        document.body.style.pointerEvents = 'auto'
      }
      client?.log(['Missing wallet, prompting connection'], LogLevel.Verbose)
      return
    }

    let activeWalletChain = getNetwork().chain
    if (activeWalletChain && rendererChain?.id !== activeWalletChain?.id) {
      activeWalletChain = await switchNetwork({
        chainId: rendererChain?.id as number,
      })
    }
    if (rendererChain?.id !== activeWalletChain?.id) {
      const error = new Error(`Mismatching chainIds`)
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
      currency: paymentCurrency?.address,
    }

    if (feesOnTopBps && feesOnTopBps?.length > 0) {
      const fixedFees = feesOnTopBps.map((fullFee) => {
        const [referrer, feeBps] = fullFee.split(':')
        const totalFeeTruncated = toFixed(
          total - feeOnTop,
          paymentCurrency?.decimals || 18
        )
        const fee = Math.floor(
          Number(
            parseUnits(
              `${Number(totalFeeTruncated)}`,
              paymentCurrency?.decimals || 18
            ) * BigInt(feeBps)
          ) / 10000
        )
        const atomicUnitsFee = formatUnits(BigInt(fee), 0)
        return `${referrer}:${atomicUnitsFee}`
      })
      options.feesOnTop = fixedFees
    } else if (feesOnTopUsd && feesOnTopUsd.length > 0 && usdPrice) {
      const feesOnTopFixed = feesOnTopUsd.map((feeOnTop) => {
        const [recipient, fee] = feeOnTop.split(':')
        const atomicUsdPrice = parseUnits(`${usdPrice}`, 6)
        const atomicFee = BigInt(fee)
        const convertedAtomicFee =
          atomicFee * BigInt(10 ** paymentCurrency?.decimals!)
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
        chainId: rendererChain?.id,
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
          [paymentCurrency?.address || zeroAddress]: {
            amount: total,
            raw: parseUnits(`${total}`, paymentCurrency?.decimals || 18),
            currencyAddress: paymentCurrency?.address,
            currencyDecimals: paymentCurrency?.decimals || 18,
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

          const transactionSteps = steps.filter(
            (step) =>
              step.kind === 'transaction' &&
              step.items &&
              step.items?.length > 0
          )

          if (
            transactionSteps.length > 0 &&
            transactionSteps.every((step) =>
              step.items?.every((item) => item.txHash)
            )
          ) {
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
    address,
    total,
    normalizeRoyalties,
    wagmiChain,
    rendererChain,
    collectionId,
    tokenId,
    feesOnTopBps,
    onConnectWallet,
    feesOnTopUsd,
    contentMode,
    itemAmount,
    paymentCurrency,
  ])

  return (
    <>
      {children({
        contentMode,
        collection,
        token,
        loading: !fetchedInitialOrders,
        address: address,
        selectedTokens,
        setSelectedTokens,
        itemAmount,
        setItemAmount,
        maxItemAmount,
        setMaxItemAmount,
        paymentCurrency,
        setPaymentCurrency,
        chainCurrency,
        paymentTokens,
        total,
        totalIncludingFees,
        totalUsd,
        feeOnTop,
        feeUsd,
        usdPrice,
        isConnected: wallet !== undefined,
        currentChain,
        mintPrice,
        orders,
        balance: paymentCurrency?.balance
          ? BigInt(paymentCurrency.balance)
          : undefined,
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
