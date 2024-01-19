import React, {
  FC,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  useChainCurrency,
  useCollections,
  useReservoirClient,
  useTokens,
} from '../../hooks'
import usePaymentTokensv2 from '../../hooks/usePaymentTokensv2'
import { useAccount, useWalletClient } from 'wagmi'
import {
  BuyPath,
  Execute,
  LogLevel,
  ReservoirChain,
  ReservoirClientActions,
  axios,
} from '@reservoir0x/reservoir-sdk'
import { Address, WalletClient, formatUnits, zeroAddress } from 'viem'
import { EnhancedCurrency } from '../../hooks/usePaymentTokensv2'
import { getNetwork, switchNetwork } from 'wagmi/actions'
import * as allChains from 'viem/chains'
import {
  customChains,
  ReservoirWallet,
  BuyResponses,
} from '@reservoir0x/reservoir-sdk'
import { ProviderOptionsContext } from '../../ReservoirKitProvider'

export enum SweepStep {
  Idle,
  SelectPayment,
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

type BuyTokenOptions = Parameters<
  ReservoirClientActions['buyToken']
>['0']['options']

export type ChildrenProps = {
  collection?: NonNullable<ReturnType<typeof useCollections>['data']>[0]
  token?: NonNullable<ReturnType<typeof useTokens>['data']>[0]
  loading: boolean
  isFetchingPath: boolean
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
  averageUnitPrice: bigint
  chainCurrency: ReturnType<typeof useChainCurrency>
  paymentTokens: EnhancedCurrency[]
  totalIncludingFees: bigint
  feeOnTop: bigint
  feeUsd: string
  usdPrice: number
  usdPriceRaw: bigint
  currentChain: ReservoirChain | null | undefined
  address?: string
  balance?: bigint
  isConnected: boolean
  disableJumperLink?: boolean
  hasEnoughCurrency: boolean
  addFundsLink: string
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
  contract?: string
  collectionId?: string
  token?: string
  onConnectWallet: () => void
  chainId?: number
  defaultQuantity?: number
  feesOnTopBps?: string[] | null
  feesOnTopUsd?: string[] | null
  normalizeRoyalties?: boolean
  children: (props: ChildrenProps) => ReactNode
  walletClient?: ReservoirWallet | WalletClient
  usePermit?: boolean
}

export const SweepModalRenderer: FC<Props> = ({
  open,
  chainId,
  contract,
  collectionId,
  token,
  feesOnTopBps,
  feesOnTopUsd,
  defaultQuantity,
  onConnectWallet,
  normalizeRoyalties,
  children,
  walletClient,
  usePermit,
}) => {
  const client = useReservoirClient()
  const { address } = useAccount()
  const [selectedTokens, setSelectedTokens] = useState<NonNullable<BuyPath>>([])
  const [isFetchingPath, setIsFetchingPath] = useState(false)
  const [fetchedInitialOrders, setFetchedInitialOrders] = useState(false)
  const [orders, setOrders] = useState<NonNullable<BuyPath>>([])
  const [itemAmount, setItemAmount] = useState<number>(1)
  const [maxItemAmount, setMaxItemAmount] = useState<number>(1)
  const [sweepStep, setSweepStep] = useState<SweepStep>(SweepStep.Idle)
  const [stepData, setStepData] = useState<SweepModalStepData | null>(null)
  const [transactionError, setTransactionError] = useState<Error | null>()
  const [totalIncludingFees, setTotalIncludingFees] = useState(0n)
  const [averageUnitPrice, setAverageUnitPrice] = useState(0n)

  const [hasEnoughCurrency, setHasEnoughCurrency] = useState(true)
  const [feeOnTop, setFeeOnTop] = useState(0n)

  const [buyResponseFees, setBuyResponseFees] = useState<
    BuyResponses['fees'] | undefined
  >(undefined)

  const currentChain = client?.currentChain()

  const rendererChain = chainId
    ? client?.chains.find(({ id }) => id === chainId) || currentChain
    : currentChain

  const chainCurrency = useChainCurrency(rendererChain?.id)

  const collectionContract =
    contract ?? collectionId?.split(':')?.[0] ?? token?.split(':')?.[0]
  const tokenId = token?.split(':')?.[1]

  const wagmiChain: allChains.Chain | undefined = Object.values({
    ...allChains,
    ...customChains,
  }).find(({ id }) => rendererChain?.id === id)

  const providerOptions = useContext(ProviderOptionsContext)
  const disableJumperLink = providerOptions?.disableJumperLink
  const includeListingCurrency =
    providerOptions.alwaysIncludeListingCurrency !== false

  const { data: wagmiWallet } = useWalletClient({ chainId: rendererChain?.id })

  const wallet = walletClient || wagmiWallet

  const blockExplorerBaseUrl =
    wagmiChain?.blockExplorers?.default?.url || 'https://etherscan.io'

  const {
    data: collections,
    mutate: mutateCollection,
    isFetchingPage: isFetchingCollections,
  } = useCollections(
    open && {
      contract: collectionId ? undefined : collectionContract,
      id: collectionId ? collectionId : undefined,
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

  const [_paymentCurrency, _setPaymentCurrency] = useState<
    EnhancedCurrency | undefined
  >(undefined)

  const paymentKey = useMemo(() => {
    if (token) {
      return token
    } else if (tokenData?.token?.tokenId && collectionContract) {
      return `${collectionContract}:${tokenData?.token?.tokenId}`
    } else if (collectionId) {
      return collectionId
    } else return collectionContract
  }, [token, collectionId, , collectionContract, tokenData?.token?.tokenId])

  const paymentTokens = usePaymentTokensv2({
    open,
    address: address as Address,
    quantityToken: {
      [`${paymentKey}`]: itemAmount,
    },
    path: orders,
    nativeOnly: false,
    chainId: rendererChain?.id,
    crossChainDisabled: !is1155,
  })

  const paymentCurrency = paymentTokens?.find(
    (paymentToken: EnhancedCurrency) =>
      paymentToken?.address === _paymentCurrency?.address &&
      paymentToken?.chainId === _paymentCurrency?.chainId
  )

  const usdPrice = paymentCurrency?.usdPrice || 0
  const usdPriceRaw = paymentCurrency?.usdPriceRaw || 0n

  const feeUsd = formatUnits(
    feeOnTop * usdPriceRaw,
    (paymentCurrency?.decimals || 18) + 6
  )

  const fetchBuyPath = useCallback(
    (
      paymentCurrency: EnhancedCurrency | undefined,
      paymentTokens: EnhancedCurrency[]
    ) => {
      if (!open || !client || paymentTokens.length === 0) {
        return
      }

      setIsFetchingPath(true)

      let options: BuyTokenOptions = {
        partial: true,
        onlyPath: true,
      }

      if (is1155) {
        if (feesOnTopBps && feesOnTopBps?.length > 0) {
          const fixedFees = feesOnTopBps.map((fullFee) => {
            const [referrer] = fullFee.split(':')
            return `${referrer}:1`
          })
          options.feesOnTop = fixedFees
        } else if (feesOnTopUsd && feesOnTopUsd.length > 0) {
          const feesOnTopFixed = feesOnTopUsd.map((feeOnTop) => {
            const [recipient] = feeOnTop.split(':')
            return `${recipient}:1`
          })
          options.feesOnTop = feesOnTopFixed
        } else if (!feesOnTopUsd && !feesOnTopBps) {
          delete options.feesOnTop
        }
      }

      if (normalizeRoyalties !== undefined) {
        options.normalizeRoyalties = normalizeRoyalties
      }

      if (paymentCurrency) {
        options.currency = paymentCurrency.address
        if (paymentCurrency.chainId) {
          options.currencyChainId = paymentCurrency.chainId
        }
      } else if (!includeListingCurrency) {
        options.currency = paymentTokens[0].address
        if (paymentTokens[0].chainId) {
          options.currencyChainId = paymentTokens[0].chainId
        }
        _setPaymentCurrency(paymentTokens[0])
      }

      return client?.actions
        .buyToken({
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
              fillType: 'trade',
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

          if ('path' in data) {
            let pathData = data['path']
            setOrders(pathData ?? [])

            if (data.fees) {
              setBuyResponseFees(data.fees)
            }

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

            if (!paymentCurrency && pathData?.[0]) {
              const listingToken = {
                address: (pathData[0].buyInCurrency ||
                  pathData[0].currency) as Address,
                decimals:
                  pathData[0].buyInCurrencyDecimals ||
                  pathData[0].currencyDecimals ||
                  18,
                symbol:
                  pathData[0].buyInCurrencySymbol ||
                  pathData[0].currencySymbol ||
                  '',
                name:
                  pathData[0].buyInCurrencySymbol ||
                  pathData[0].currencySymbol ||
                  '',
                chainId: rendererChain?.id || 1,
              }

              _setPaymentCurrency(listingToken)
            }
          }
        })
        .catch((err) => {
          setOrders([])
          throw err
        })
        .finally(() => {
          setFetchedInitialOrders(true)
          setIsFetchingPath(false)
        })
    },
    [
      address,
      client,
      wallet,
      rendererChain,
      normalizeRoyalties,
      collectionId,
      tokenData?.token?.tokenId,
      collectionContract,
      collection?.id,
      tokenId,
      rendererChain?.paymentTokens,
      is1155,
      includeListingCurrency,
      feesOnTopBps,
      feesOnTopUsd,
      _setPaymentCurrency,
    ]
  )

  const setPaymentCurrency: typeof _setPaymentCurrency = useCallback(
    (
      value:
        | EnhancedCurrency
        | ((
            prevState: EnhancedCurrency | undefined
          ) => EnhancedCurrency | undefined)
        | undefined
    ) => {
      if (typeof value === 'function') {
        _setPaymentCurrency((prevState) => {
          const newValue = value(prevState)
          if (
            newValue?.address !== paymentCurrency?.address ||
            newValue?.chainId !== paymentCurrency?.chainId
          ) {
            fetchBuyPath(newValue, paymentTokens)?.catch((err) => {
              if (
                err?.statusCode === 400 &&
                err?.message?.includes('Price too high')
              ) {
                _setPaymentCurrency(prevState)
              }
            })
          }
          return newValue
        })
      } else {
        if (
          value?.address !== paymentCurrency?.address ||
          value?.chainId !== paymentCurrency?.chainId
        ) {
          _setPaymentCurrency(value)
          fetchBuyPath(value, paymentTokens)?.catch((err) => {
            if (
              err?.statusCode === 400 &&
              err?.message?.includes('Price too high')
            ) {
              _setPaymentCurrency(paymentCurrency)
            }
          })
        }
      }
    },
    [fetchBuyPath, _setPaymentCurrency, paymentCurrency]
  )

  const fetchBuyPathIfIdle = useCallback(() => {
    if (collection && sweepStep === SweepStep.Idle) {
      fetchBuyPath(paymentCurrency, paymentTokens)
    }
  }, [fetchBuyPath, sweepStep, collection])

  useEffect(() => {
    if (open) {
      fetchBuyPathIfIdle()

      const intervalId = setInterval(fetchBuyPathIfIdle, 60000) // Poll buy api every 1 minute
      return () => clearInterval(intervalId)
    }
  }, [client, wallet, open, fetchBuyPathIfIdle, tokenId, is1155, collection])

  useEffect(() => {
    let totalFees = 0n

    if (
      paymentCurrency?.currencyTotalRaw &&
      paymentCurrency.currencyTotalRaw > 0n
    ) {
      let currencyTotalRawMinusRelayerFees = paymentCurrency?.currencyTotalRaw

      // if cross-chain, subtract relayer fees from currencyTotalRaw
      if (buyResponseFees?.relayer?.amount?.raw) {
        const relayerFees = BigInt(buyResponseFees?.relayer?.amount?.raw ?? 0)

        currencyTotalRawMinusRelayerFees -= relayerFees
      }

      if (feesOnTopBps && feesOnTopBps.length > 0) {
        const fees = feesOnTopBps.reduce((totalFees, feeOnTop) => {
          const [_, fee] = feeOnTop.split(':')
          return (
            totalFees +
            (BigInt(fee) * currencyTotalRawMinusRelayerFees) / 10000n
          )
        }, 0n)
        totalFees += fees
        setFeeOnTop(fees)
      } else if (feesOnTopUsd && feesOnTopUsd.length > 0 && usdPriceRaw) {
        const fees = feesOnTopUsd.reduce((totalFees, feeOnTop) => {
          const [_, fee] = feeOnTop.split(':')
          const atomicFee = BigInt(fee)
          const convertedAtomicFee =
            atomicFee * BigInt(10 ** paymentCurrency?.decimals!)
          const currencyFee = convertedAtomicFee / usdPriceRaw
          return totalFees + currencyFee
        }, 0n)
        totalFees += fees
        setFeeOnTop(fees)
      } else {
        setFeeOnTop(0n)
      }

      setTotalIncludingFees(paymentCurrency.currencyTotalRaw + totalFees)
      setAverageUnitPrice(paymentCurrency.currencyTotalRaw / BigInt(itemAmount))
    } else {
      setTotalIncludingFees(0n)
      setAverageUnitPrice(0n)
    }
  }, [
    paymentCurrency,
    feesOnTopBps,
    feesOnTopUsd,
    usdPriceRaw,
    itemAmount,
    buyResponseFees,
  ])

  const addFundsLink = paymentCurrency?.address
    ? `https://jumper.exchange/?toChain=${rendererChain?.id}&toToken=${paymentCurrency?.address}`
    : `https://jumper.exchange/?toChain=${rendererChain?.id}`

  // Determine if user has enough funds in paymentToken
  useEffect(() => {
    if (
      paymentCurrency?.balance != undefined &&
      totalIncludingFees != undefined &&
      BigInt(paymentCurrency?.balance) < totalIncludingFees
    ) {
      setHasEnoughCurrency(false)
    } else {
      setHasEnoughCurrency(true)
    }
  }, [totalIncludingFees, paymentCurrency?.balance])

  useEffect(() => {
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
  }, [itemAmount, maxItemAmount, orders])

  axios.defaults.headers.common['x-rkui-context'] = open
    ? 'sweepModalRenderer'
    : ''

  // Reset state on close
  useEffect(() => {
    if (!open) {
      setSelectedTokens([])
      setOrders([])
      setItemAmount(1)
      setMaxItemAmount(1)
      setSweepStep(SweepStep.Idle)
      setTransactionError(null)
      setFetchedInitialOrders(false)
      setIsFetchingPath(false)
      _setPaymentCurrency(undefined)
      setBuyResponseFees(undefined)
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

  const sweepTokens = useCallback(async () => {
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
    let options: BuyTokenOptions = {
      partial: true,
      currency: paymentCurrency?.address,
      currencyChainId: paymentCurrency?.chainId,
    }

    const relayerFee = BigInt(buyResponseFees?.relayer?.amount?.raw ?? 0)

    if (feesOnTopBps && feesOnTopBps?.length > 0) {
      const fixedFees = feesOnTopBps.map((fullFee) => {
        const [referrer, feeBps] = fullFee.split(':')
        let totalFeeTruncated = totalIncludingFees - feeOnTop

        // if relayer fee, subtract from total
        if (relayerFee) {
          totalFeeTruncated -= relayerFee
        }

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

    if (normalizeRoyalties !== undefined) {
      options.normalizeRoyalties = normalizeRoyalties
    }

    if (usePermit) {
      options.usePermit = true
    }

    setSweepStep(SweepStep.Approving)

    client.actions
      .buyToken({
        chainId: rendererChain?.id,
        items: [
          {
            collection: tokenData?.token?.tokenId ? undefined : collection?.id,
            token: tokenData?.token?.tokenId
              ? `${collectionContract}:${tokenData?.token?.tokenId}`
              : undefined,
            quantity: itemAmount,
            fillType: 'trade',
          },
        ],
        expectedPrice: {
          [paymentCurrency?.address || zeroAddress]: {
            raw: totalIncludingFees - relayerFee,
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
      .catch((error: Error) => {
        setTransactionError(error)
        setSweepStep(SweepStep.Idle)
        mutateCollection()
        fetchBuyPath(paymentCurrency, paymentTokens)
      })
  }, [
    selectedTokens,
    client,
    wallet,
    address,
    totalIncludingFees,
    normalizeRoyalties,
    wagmiChain,
    rendererChain,
    collectionId,
    collection?.id,
    tokenId,
    feesOnTopBps,
    onConnectWallet,
    feesOnTopUsd,
    itemAmount,
    tokenData?.token?.tokenId,
    collectionContract,
    paymentCurrency?.address,
    paymentCurrency?.chainId,
    paymentCurrency?.currencyTotalRaw,
    paymentTokens,
    buyResponseFees,
    usePermit,
  ])

  return (
    <>
      {children({
        collection,
        token: tokenData,
        loading:
          isFetchingCollections ||
          (!isFetchingCollections && collection && !fetchedInitialOrders) ||
          ((token !== undefined || isSingleToken1155) && !tokenData) ||
          !(paymentTokens.length > 0),
        isFetchingPath,
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
        totalIncludingFees,
        averageUnitPrice,
        feeOnTop,
        feeUsd,
        usdPrice,
        disableJumperLink,
        usdPriceRaw,
        isConnected: wallet !== undefined,
        currentChain,
        orders,
        balance: paymentCurrency?.balance
          ? BigInt(paymentCurrency.balance)
          : undefined,
        hasEnoughCurrency,
        addFundsLink,
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
