import React, {
  FC,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { Address, WalletClient, formatUnits, zeroAddress } from 'viem'
import { useAccount, useWalletClient } from 'wagmi'
import { getNetwork, switchNetwork } from 'wagmi/actions'
import {
  Execute,
  LogLevel,
  MintPath,
  MintResponses,
  ReservoirChain,
  ReservoirClientActions,
  ReservoirWallet,
  customChains,
} from '@reservoir0x/reservoir-sdk'
import {
  useChainCurrency,
  useCollections,
  useReservoirClient,
  useTokens,
} from '../../hooks'
import * as allChains from 'viem/chains'
import { ProviderOptionsContext } from '../../ReservoirKitProvider'
import usePaymentTokens, {
  EnhancedCurrency,
} from '../../hooks/usePaymentTokens'

export enum MintStep {
  Idle,
  SelectPayment,
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

type MintTokenOptions = Parameters<
  ReservoirClientActions['mintToken']
>['0']['options']

type ChildrenProps = {
  loading: boolean
  collection?: NonNullable<ReturnType<typeof useCollections>['data']>[0]
  token?: NonNullable<ReturnType<typeof useTokens>['data']>[0]
  orders: NonNullable<MintPath>
  currentChain: ReservoirChain | null | undefined
  chainCurrency: ReturnType<typeof useChainCurrency>
  paymentTokens: EnhancedCurrency[]
  paymentCurrency?: EnhancedCurrency
  setPaymentCurrency: React.Dispatch<
    React.SetStateAction<EnhancedCurrency | undefined>
  >
  address?: string
  balance?: bigint
  total: bigint
  totalIncludingFees: bigint
  gasCost: bigint
  feeOnTop: bigint
  feeUsd: string
  usdPrice: number
  usdPriceRaw: bigint
  isConnected: boolean
  disableJumperLink?: boolean
  hasEnoughCurrency: boolean
  transactionError: Error | null | undefined
  fetchMintPathError: Error | null | undefined
  stepData: MintModalStepData | null
  addFundsLink: string
  mintStep: MintStep
  itemAmount: number
  setItemAmount: React.Dispatch<React.SetStateAction<number>>
  maxItemAmount: number
  setMaxItemAmount: React.Dispatch<React.SetStateAction<number>>
  setStepData: React.Dispatch<React.SetStateAction<MintModalStepData | null>>
  setMintStep: React.Dispatch<React.SetStateAction<MintStep>>
  mintTokens: () => void
}

type Props = {
  open: boolean
  contract?: string
  collectionId?: string
  token?: string
  onConnectWallet: () => void
  chainId?: number
  defaultQuantity?: number
  feesOnTopBps?: string[] | null
  feesOnTopUsd?: string[] | null
  children: (props: ChildrenProps) => ReactNode
  walletClient?: ReservoirWallet | WalletClient
}

export const MintModalRenderer: FC<Props> = ({
  open,
  contract,
  collectionId,
  token,
  onConnectWallet,
  chainId,
  defaultQuantity,
  feesOnTopBps,
  feesOnTopUsd,
  children,
  walletClient,
}) => {
  const client = useReservoirClient()
  const { address } = useAccount()
  const [mintStep, setMintStep] = useState<MintStep>(MintStep.Idle)
  const [stepData, setStepData] = useState<MintModalStepData | null>(null)
  const [orders, setOrders] = useState<NonNullable<MintPath>>([])
  const [fetchedInitialOrders, setFetchedInitialOrders] = useState(false)
  const [itemAmount, setItemAmount] = useState<number>(1)
  const [maxItemAmount, setMaxItemAmount] = useState<number>(1)
  const [transactionError, setTransactionError] = useState<Error | null>()
  const [fetchMintPathError, setFetchMintPathError] = useState<Error | null>()
  const [total, setTotal] = useState(0n)
  const [totalIncludingFees, setTotalIncludingFees] = useState(0n)
  const [gasCost, setGasCost] = useState(0n)
  const [hasEnoughCurrency, setHasEnoughCurrency] = useState(true)
  const [feeOnTop, setFeeOnTop] = useState(0n)

  const currentChain = client?.currentChain()

  const rendererChain = chainId
    ? client?.chains.find(({ id }) => id === chainId) || currentChain
    : currentChain

  const { data: wagmiWallet } = useWalletClient({ chainId: rendererChain?.id })

  const wallet = walletClient || wagmiWallet

  const chainCurrency = useChainCurrency(rendererChain?.id)

  const wagmiChain: allChains.Chain | undefined = Object.values({
    ...allChains,
    ...customChains,
  }).find(({ id }) => rendererChain?.id === id)

  const providerOptions = useContext(ProviderOptionsContext)
  const disableJumperLink = providerOptions?.disableJumperLink

  const collectionContract =
    contract ?? collectionId?.split(':')?.[0] ?? token?.split(':')?.[0]
  const tokenId = token?.split(':')?.[1]

  const {
    data: collections,
    mutate: mutateCollection,
    isFetchingPage: isFetchingCollections,
  } = useCollections(
    open && {
      contract: collectionId ? undefined : collectionContract,
      id: collectionId ? collectionId : undefined,
      includeMintStages: true,
    },
    {},
    rendererChain?.id
  )

  const collection = collections && collections[0] ? collections[0] : undefined
  const is1155 = collection?.contractKind === 'erc1155'

  const isSingleToken1155 = is1155 && collection?.tokenCount === '1'

  const { data: tokens } = useTokens(
    open && collection && (tokenId || isSingleToken1155)
      ? {
          collection: isSingleToken1155 ? collection?.id : undefined,
          tokens: isSingleToken1155
            ? undefined
            : `${collectionContract}:${tokenId}`,
        }
      : undefined,
    {},
    rendererChain?.id
  )

  const tokenData = tokens && tokens[0] ? tokens[0] : undefined

  const [_paymentCurrency, setPaymentCurrency] = useState<
    EnhancedCurrency | undefined
  >(undefined)

  const paymentTokens = usePaymentTokens(
    open,
    address as Address,
    _paymentCurrency ?? chainCurrency,
    totalIncludingFees,
    rendererChain?.id,
    true,
    false,
    chainCurrency
  )

  const paymentCurrency = paymentTokens?.find(
    (paymentToken) =>
      paymentToken?.address === _paymentCurrency?.address &&
      paymentToken?.chainId === _paymentCurrency?.chainId
  )

  const mintPrice = BigInt(
    (orders?.[0]?.currency?.toLowerCase() !== paymentCurrency?.address
      ? orders?.[0]?.buyIn?.[0]?.amount?.raw
      : orders?.[0]?.totalRawPrice) || 0
  )

  const usdPrice = paymentCurrency?.usdPrice || 0
  const usdPriceRaw = paymentCurrency?.usdPriceRaw || 0n
  const feeUsd = formatUnits(
    feeOnTop * usdPriceRaw,
    (paymentCurrency?.decimals || 18) + 6
  )

  // Fetch mint path
  const fetchMintPath = useCallback(() => {
    if (!client) {
      return
    }

    let options: MintTokenOptions = {
      partial: true,
      onlyPath: true,
      currencyChainId: paymentCurrency?.chainId,
    }

    client?.actions
      .mintToken({
        context: 'mintModalRenderer',
        chainId: rendererChain?.id,
        items: [
          {
            collection:
              token ?? tokenData?.token?.tokenId ? undefined : collection?.id,
            token:
              token ?? tokenData?.token?.tokenId
                ? `${collectionContract}:${
                    tokenId ?? tokenData?.token?.tokenId
                  }`
                : undefined,
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
        let data = rawData as MintResponses

        if ('path' in data) {
          let pathData = data['path']
          setOrders(pathData ?? [])

          const pathOrderQuantity =
            pathData?.reduce(
              (quantity, order) => quantity + (order?.quantity || 1),
              0
            ) || 0
          let totalMaxQuantity = pathOrderQuantity
          if ('maxQuantities' in data && data.maxQuantities?.[0]) {
            if (is1155) {
              totalMaxQuantity = data.maxQuantities.reduce(
                (total, currentQuantity) =>
                  total + Number(currentQuantity.maxQuantity ?? 1),
                0
              )
            } else {
              let maxQuantity = data.maxQuantities?.[0].maxQuantity
              // if value is null/undefined, we don't know max quantity, but simulation succeeed with quantity of 1
              totalMaxQuantity = maxQuantity ? Number(maxQuantity) : 1
            }
          }
          setMaxItemAmount(
            pathOrderQuantity > totalMaxQuantity
              ? totalMaxQuantity
              : pathOrderQuantity
          )
        }
      })
      .catch((err) => {
        setOrders([])
        setFetchMintPathError(err)
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
    contract,
    tokenId,
    collection,
    tokenData?.token?.tokenId,
    paymentCurrency?.address,
    paymentCurrency?.chainId,
    is1155,
  ])

  const fetchBuyPathIfIdle = useCallback(() => {
    if (collection && mintStep === MintStep.Idle) {
      fetchMintPath()
    }
  }, [fetchMintPath, mintStep, collection])

  useEffect(() => {
    if (open) {
      fetchBuyPathIfIdle()
    }
  }, [
    client,
    wallet,
    open,
    fetchBuyPathIfIdle,
    paymentCurrency?.address,
    collection,
  ])

  const calculateFees = useCallback(
    (totalPrice: bigint) => {
      let fees = 0n
      if (feesOnTopBps && feesOnTopBps.length > 0) {
        fees = feesOnTopBps.reduce((totalFees, feeOnTop) => {
          const [_, fee] = feeOnTop.split(':')
          return totalFees + (BigInt(fee) * totalPrice) / 10000n
        }, 0n)
      } else if (feesOnTopUsd && feesOnTopUsd.length > 0 && usdPriceRaw) {
        fees = feesOnTopUsd.reduce((totalFees, feeOnTop) => {
          const [_, fee] = feeOnTop.split(':')
          const atomicFee = BigInt(fee)
          const convertedAtomicFee =
            atomicFee * BigInt(10 ** paymentCurrency?.decimals!)
          const currencyFee = convertedAtomicFee / usdPriceRaw
          const parsedFee = formatUnits(currencyFee, 0)
          return totalFees + BigInt(parsedFee)
        }, 0n)
      }

      return fees
    },
    [feesOnTopBps, feeOnTop, usdPriceRaw, feesOnTopUsd, paymentCurrency]
  )

  useEffect(() => {
    let updatedTotal = 0n
    let gasCost = 0n

    // Mint erc1155
    if (is1155) {
      let remainingQuantity = itemAmount

      for (const order of orders) {
        if (remainingQuantity >= 0) {
          let orderQuantity = order?.quantity || 1
          let orderPricePerItem = BigInt(
            (order?.currency?.toLowerCase() !== paymentCurrency?.address
              ? order?.buyIn?.[0]?.amount?.raw
              : order?.totalRawPrice) || 0
          )

          if (remainingQuantity >= orderQuantity) {
            updatedTotal += orderPricePerItem * BigInt(orderQuantity)
            remainingQuantity -= orderQuantity
          } else {
            let fractionalPrice = orderPricePerItem * BigInt(remainingQuantity)
            updatedTotal += fractionalPrice
            remainingQuantity = 0
          }
          gasCost += BigInt(order.gasCost || 0n)
        }
      }
    }

    // Mint erc721
    else {
      updatedTotal = mintPrice * BigInt(Math.max(0, itemAmount) || 0)
      gasCost += orders[0] && orders[0].gasCost ? BigInt(orders[0].gasCost) : 0n
    }

    const fees = calculateFees(updatedTotal)
    setFeeOnTop(fees)
    setTotal(updatedTotal)
    setTotalIncludingFees(updatedTotal + fees)
    setGasCost(gasCost)
  }, [paymentCurrency, feesOnTopBps, feesOnTopUsd, itemAmount, orders])

  const addFundsLink = paymentCurrency?.address
    ? `https://jumper.exchange/?toChain=${rendererChain?.id}&toToken=${paymentCurrency?.address}`
    : `https://jumper.exchange/?toChain=${rendererChain?.id}`

  // Determine if user has enough funds in paymentToken
  useEffect(() => {
    if (
      paymentCurrency?.balance != undefined &&
      paymentCurrency?.currencyTotalRaw != undefined &&
      BigInt(paymentCurrency?.balance) <
        paymentCurrency?.currencyTotalRaw + gasCost
    ) {
      setHasEnoughCurrency(false)
    } else {
      setHasEnoughCurrency(true)
    }
  }, [total, paymentCurrency, gasCost])

  // Set initial payment currency
  useEffect(() => {
    if (paymentTokens[0] && !paymentCurrency) {
      setPaymentCurrency(paymentTokens[0])
    }
  }, [paymentTokens, paymentCurrency])

  // Reset state on close
  useEffect(() => {
    if (!open) {
      setOrders([])
      setItemAmount(1)
      setMaxItemAmount(1)
      setMintStep(MintStep.Idle)
      setTransactionError(null)
      setFetchMintPathError(null)
      setFetchedInitialOrders(false)
      setPaymentCurrency(undefined)
      setStepData(null)
    } else {
      setItemAmount(defaultQuantity || 1)
    }
  }, [open])

  useEffect(() => {
    if (maxItemAmount > 0 && itemAmount > maxItemAmount) {
      setItemAmount(maxItemAmount)
    }
  }, [maxItemAmount, itemAmount])

  const mintTokens = useCallback(async () => {
    if (!wallet) {
      onConnectWallet()
      if (document.body.style) {
        document.body.style.pointerEvents = 'auto'
      }
      client?.log(['Missing wallet, prompting connection'], LogLevel.Verbose)
      return
    }

    let activeWalletChain = getNetwork().chain
    if (
      activeWalletChain &&
      paymentCurrency?.chainId !== activeWalletChain?.id
    ) {
      activeWalletChain = await switchNetwork({
        chainId: paymentCurrency?.chainId as number,
      })
    }
    if (paymentCurrency?.chainId !== activeWalletChain?.id) {
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
    let options: MintTokenOptions = {
      partial: true,
      currencyChainId: paymentCurrency?.chainId,
    }

    if (feesOnTopBps && feesOnTopBps?.length > 0) {
      const fixedFees = feesOnTopBps.map((fullFee) => {
        const [referrer, feeBps] = fullFee.split(':')
        const totalFeeTruncated = totalIncludingFees - feeOnTop

        const fee = Math.floor(
          Number(totalFeeTruncated * BigInt(feeBps)) / 10000
        )
        const atomicUnitsFee = formatUnits(BigInt(fee), 0)
        return `${referrer}:${atomicUnitsFee}`
      })
      options.feesOnTop = fixedFees
    } else if (feesOnTopUsd && feesOnTopUsd.length > 0 && usdPriceRaw) {
      const feesOnTopFixed = feesOnTopUsd.map((feeOnTop) => {
        const [recipient, fee] = feeOnTop.split(':')
        const atomicFee = BigInt(fee)
        const convertedAtomicFee =
          atomicFee * BigInt(10 ** paymentCurrency?.decimals!)
        const currencyFee = convertedAtomicFee / usdPriceRaw
        const parsedFee = formatUnits(currencyFee, 0)
        return `${recipient}:${parsedFee}`
      })
      options.feesOnTop = feesOnTopFixed
    } else if (!feesOnTopUsd && !feesOnTopBps) {
      delete options.feesOnTop
    }

    setMintStep(MintStep.Approving)

    client.actions
      .mintToken({
        context: 'mintModalRenderer',
        chainId: rendererChain?.id,
        items: [
          {
            collection: tokenData?.token?.tokenId ? undefined : collection?.id,
            token: tokenData?.token?.tokenId
              ? `${collectionContract}:${tokenData?.token?.tokenId}`
              : undefined,
            quantity: itemAmount,
          },
        ],
        expectedPrice: {
          [paymentCurrency?.address || zeroAddress]: {
            raw: total,
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

          if (
            currentStepIndex + 1 === executableSteps.length &&
            currentStep?.items?.every((item) => item.txHashes)
          ) {
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
      .catch((error: Error) => {
        setTransactionError(error)
        setMintStep(MintStep.Idle)
        mutateCollection()
        fetchMintPath()
      })
  }, [
    client,
    wallet,
    address,
    total,
    totalIncludingFees,
    wagmiChain,
    rendererChain,
    contract,
    token,
    feesOnTopBps,
    onConnectWallet,
    feesOnTopUsd,
    itemAmount,
    paymentCurrency?.address,
    paymentCurrency?.chainId,
    tokenData?.token?.tokenId,
    collection?.id,
    collectionContract,
  ])

  return (
    <>
      {children({
        loading:
          isFetchingCollections ||
          (!isFetchingCollections && collection && !fetchedInitialOrders) ||
          ((token !== undefined || isSingleToken1155) && !tokenData) ||
          !(paymentTokens.length > 0),
        collection,
        token: tokenData,
        orders,
        total,
        totalIncludingFees,
        feeOnTop,
        feeUsd,
        gasCost,
        paymentTokens,
        paymentCurrency,
        setPaymentCurrency,
        addFundsLink,
        chainCurrency,
        itemAmount,
        setItemAmount,
        maxItemAmount,
        setMaxItemAmount,
        usdPrice,
        usdPriceRaw,
        currentChain,
        address,
        isConnected: wallet !== undefined,
        disableJumperLink,
        balance: paymentCurrency?.balance
          ? BigInt(paymentCurrency.balance)
          : undefined,
        hasEnoughCurrency,
        transactionError,
        fetchMintPathError,
        stepData,
        mintStep,
        setStepData,
        setMintStep,
        mintTokens,
      })}
    </>
  )
}
