import React, {
  FC,
  useEffect,
  useState,
  useCallback,
  ReactNode,
  useMemo,
  useContext,
} from 'react'
import {
  useTokens,
  useReservoirClient,
  useCollections,
  useListings,
} from '../../hooks'
import { useAccount, useWalletClient } from 'wagmi'
import { getNetwork, switchNetwork } from 'wagmi/actions'
import {
  APIError,
  BuyPath,
  BuyResponses,
  Execute,
  LogLevel,
  ReservoirClientActions,
  ReservoirWallet,
  axios,
  BuyTokenBodyParameters,
} from '@reservoir0x/reservoir-sdk'
import { Address, WalletClient, formatUnits, zeroAddress } from 'viem'
import { customChains } from '@reservoir0x/reservoir-sdk'
import * as allChains from 'viem/chains'
import usePaymentTokensv2, {
  EnhancedCurrency,
} from '../../hooks/usePaymentTokensv2'
import { ProviderOptionsContext } from '../../ReservoirKitProvider'

type Item = Parameters<ReservoirClientActions['buyToken']>['0']['items'][0]

export enum BuyStep {
  Checkout,
  Approving,
  Complete,
  Unavailable,
  SelectPayment,
}

export type BuyModalStepData = {
  totalSteps: number
  stepProgress: number
  currentStep: Execute['steps'][0]
  currentStepItem: NonNullable<Execute['steps'][0]['items']>[0]
}

type Token = NonNullable<NonNullable<ReturnType<typeof useTokens>>['data']>[0]
export type BuyTokenOptions = NonNullable<
  Parameters<ReservoirClientActions['buyToken']>['0']['options']
>

type ChildrenProps = {
  loading: boolean
  isFetchingPath: boolean
  tokenData?: Token
  collection?: NonNullable<ReturnType<typeof useCollections>['data']>[0]
  listing?: NonNullable<ReturnType<typeof useListings>['data']>[0]
  quantityAvailable: number
  averageUnitPrice: bigint
  paymentCurrency?: EnhancedCurrency
  paymentTokens: EnhancedCurrency[]
  totalIncludingFees: bigint
  feeOnTop: bigint
  buyStep: BuyStep
  transactionError?: Error | null
  hasEnoughCurrency: boolean
  addFundsLink: string
  feeUsd: string
  totalUsd: bigint
  usdPrice: number
  balance?: bigint
  address?: string
  blockExplorerBaseUrl: string
  blockExplorerBaseName: string
  steps: Execute['steps'] | null
  stepData: BuyModalStepData | null
  path: BuyPath
  quantity: number
  isConnected: boolean
  isOwner: boolean
  setPaymentCurrency: React.Dispatch<
    React.SetStateAction<EnhancedCurrency | undefined>
  >
  setBuyStep: React.Dispatch<React.SetStateAction<BuyStep>>
  setQuantity: React.Dispatch<React.SetStateAction<number>>
  buyToken: () => void
}

type Props = {
  open: boolean
  token?: string
  orderId?: string
  chainId?: number
  defaultQuantity?: number
  feesOnTopBps?: string[] | null
  feesOnTopUsd?: string[] | null
  normalizeRoyalties?: boolean
  onConnectWallet: () => void
  children: (props: ChildrenProps) => ReactNode
  walletClient?: ReservoirWallet | WalletClient
  usePermit?: boolean
  executionMethod?: BuyTokenBodyParameters['executionMethod']
}

export const BuyModalRenderer: FC<Props> = ({
  open,
  token,
  orderId,
  chainId,
  feesOnTopBps,
  defaultQuantity,
  feesOnTopUsd,
  normalizeRoyalties,
  onConnectWallet,
  executionMethod,
  children,
  walletClient,
  usePermit,
}) => {
  const [totalIncludingFees, setTotalIncludingFees] = useState(0n)
  const [averageUnitPrice, setAverageUnitPrice] = useState(0n)
  const [path, setPath] = useState<BuyPath>(undefined)
  const [isFetchingPath, setIsFetchingPath] = useState(false)
  const [feeOnTop, setFeeOnTop] = useState(0n)
  const [buyStep, setBuyStep] = useState<BuyStep>(BuyStep.Checkout)
  const [transactionError, setTransactionError] = useState<Error | null>()
  const [hasEnoughCurrency, setHasEnoughCurrency] = useState(true)
  const [stepData, setStepData] = useState<BuyModalStepData | null>(null)
  const [steps, setSteps] = useState<Execute['steps'] | null>(null)
  const [quantity, setQuantity] = useState(1)
  const providerOptions = useContext(ProviderOptionsContext)
  const includeListingCurrency =
    providerOptions.alwaysIncludeListingCurrency !== false

  const [buyResponseFees, setBuyResponseFees] = useState<
    BuyResponses['fees'] | undefined
  >(undefined)

  const client = useReservoirClient()
  const currentChain = client?.currentChain()

  const rendererChain = chainId
    ? client?.chains.find(({ id }) => id === chainId) || currentChain
    : currentChain

  const wagmiChain: allChains.Chain | undefined = Object.values({
    ...allChains,
    ...customChains,
  }).find(({ id }) => rendererChain?.id === id)

  const { data: wagmiWalletClient } = useWalletClient({
    chainId: rendererChain?.id,
  })

  const wallet = walletClient || wagmiWalletClient

  const blockExplorerBaseUrl =
    wagmiChain?.blockExplorers?.default?.url || 'https://etherscan.io'
  const blockExplorerBaseName =
    wagmiChain?.blockExplorers?.default?.name || 'Etherscan'

  const { address } = useAccount()

  const [_paymentCurrency, _setPaymentCurrency] = useState<
    EnhancedCurrency | undefined
  >(undefined)

  const paymentTokens = usePaymentTokensv2({
    open,
    address: address as Address,
    quantityToken: {
      [`${token}`]: quantity,
    },
    path,
    chainId: rendererChain?.id,
    nativeOnly: executionMethod !== undefined,
  })

  const paymentCurrency = paymentTokens?.find(
    (paymentToken) =>
      paymentToken?.address === _paymentCurrency?.address &&
      paymentToken?.chainId === _paymentCurrency?.chainId
  )

  const { data: tokens, mutate: mutateTokens } = useTokens(
    open && token
      ? {
          tokens: [token],
          normalizeRoyalties,
        }
      : false,
    {
      revalidateFirstPage: true,
    },
    rendererChain?.id
  )

  const tokenData = tokens && tokens[0] ? tokens[0] : undefined

  const collectionId = tokenData?.token?.collection?.id

  const is1155 = tokenData?.token?.kind === 'erc1155'
  const isOwner =
    tokenData?.token?.owner?.toLowerCase() === address?.toLowerCase()

  const { data: collections, mutate: mutateCollection } = useCollections(
    open && collectionId
      ? {
          id: collectionId,
          normalizeRoyalties,
        }
      : false,
    {},
    rendererChain?.id
  )

  const collection = collections && collections[0] ? collections[0] : undefined

  const quantityRemaining = useMemo(() => {
    return path
      ? path.reduce((total, pathItem) => total + (pathItem.quantity || 0), 0)
      : 0
  }, [path, orderId])

  const usdPrice = paymentCurrency?.usdPrice || 0
  const usdPriceRaw = paymentCurrency?.usdPriceRaw || 0n
  const feeUsd = formatUnits(
    feeOnTop * usdPriceRaw,
    (paymentCurrency?.decimals || 18) + 6
  )
  const totalUsd = totalIncludingFees * usdPriceRaw

  const addFundsLink = paymentCurrency?.address
    ? `https://jumper.exchange/?toChain=${rendererChain?.id}&toToken=${paymentCurrency?.address}`
    : `https://jumper.exchange/?toChain=${rendererChain?.id}`

  const fetchPath = useCallback(
    (
      paymentCurrency: EnhancedCurrency | undefined,
      paymentTokens: EnhancedCurrency[]
    ) => {
      if (
        !open ||
        !client ||
        !tokenData ||
        !token ||
        paymentTokens.length === 0
      ) {
        setPath(undefined)
        return
      }

      setTransactionError(null)
      setIsFetchingPath(true)

      const options: BuyTokenOptions = {
        onlyPath: true,
        partial: true,
      }

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

      if (normalizeRoyalties !== undefined) {
        options.normalizeRoyalties = normalizeRoyalties
      }

      if (executionMethod) {
        options.executionMethod = executionMethod
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

      if (executionMethod !== undefined) {
        options.executionMethod = executionMethod
      }

      let items: Parameters<
        ReservoirClientActions['buyToken']
      >['0']['items'][0] = {
        fillType: 'trade',
      }

      if (orderId) {
        items.orderId = orderId
      } else {
        items.token = token
      }

      return client.actions
        .buyToken({
          options,
          chainId: rendererChain?.id,
          items: [items],
          wallet: {
            address: async () => {
              return address || zeroAddress
            },
          } as any,
          onProgress: () => {},
          precheck: true,
        })
        .then((data) => {
          if (data && (data as BuyResponses).path) {
            const response = data as BuyResponses
            const path: BuyPath = response.path
            if (!paymentCurrency && path?.[0]) {
              const listingToken = {
                address: (path[0].buyInCurrency || path[0].currency) as Address,
                decimals:
                  path[0].buyInCurrencyDecimals ||
                  path[0].currencyDecimals ||
                  18,
                symbol:
                  path[0].buyInCurrencySymbol || path[0].currencySymbol || '',
                name:
                  path[0].buyInCurrencySymbol || path[0].currencySymbol || '',
                chainId: rendererChain?.id || 1,
              }
              _setPaymentCurrency(listingToken)
            }
            setPath(path)
            if (response.fees) {
              setBuyResponseFees(response.fees)
            }
          } else {
            setPath([])
          }
        })
        .catch((err) => {
          if (!err?.response?.data?.message?.includes('Price too high')) {
            setPath([])
          } else {
            err = new APIError(
              err?.response?.data?.message,
              err?.response?.status,
              err?.response?.data
            )
            setTransactionError(err)
          }
          throw err
        })
        .finally(() => {
          setIsFetchingPath(false)
        })
    },
    [
      open,
      client,
      address,
      tokenData,
      token,
      orderId,
      normalizeRoyalties,
      rendererChain,
      rendererChain?.paymentTokens,
      includeListingCurrency,
      feesOnTopBps,
      feesOnTopUsd,
      executionMethod,
      _setPaymentCurrency,
      executionMethod,
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
            fetchPath(newValue, paymentTokens)?.catch((err) => {
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
          fetchPath(value, paymentTokens)?.catch((err) => {
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
    [fetchPath, _setPaymentCurrency, paymentCurrency]
  )

  useEffect(() => {
    if (token || orderId) {
      fetchPath(paymentCurrency, paymentTokens)
    }
  }, [fetchPath, token, orderId])

  const buyToken = useCallback(async () => {
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

    if (!token && !orderId) {
      const error = new Error('Missing token or order')
      setTransactionError(error)
      throw error
    }

    if (!client) {
      const error = new Error('ReservoirClient was not initialized')
      setTransactionError(error)
      throw error
    }

    let options: BuyTokenOptions = {
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

    if (executionMethod !== undefined) {
      options.executionMethod = executionMethod
    }

    if (usePermit) {
      options.usePermit = true
    }

    if (executionMethod) {
      options.executionMethod = executionMethod
    }

    setBuyStep(BuyStep.Approving)
    const items: Item[] = []
    const item: Item = {
      fillType: 'trade',
      quantity,
    }

    if (is1155) {
      options.partial = true
    }

    if (orderId) {
      item.orderId = orderId
    } else {
      item.token = token
    }
    items.push(item)

    client.actions
      .buyToken({
        chainId: rendererChain?.id,
        items: items,
        expectedPrice: {
          [paymentCurrency?.address || zeroAddress]: {
            raw: totalIncludingFees - relayerFee,
            currencyAddress: paymentCurrency?.address,
            currencyDecimals: paymentCurrency?.decimals || 18,
          },
        },
        wallet,
        onProgress: (steps: Execute['steps']) => {
          if (!steps) {
            return
          }
          setSteps(steps)

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
            })
          } else if (
            steps.every(
              (step) =>
                !step.items ||
                step.items.length == 0 ||
                step.items?.every((item) => item.status === 'complete')
            )
          ) {
            setBuyStep(BuyStep.Complete)
          }
        },
        options,
      })
      .catch((error: Error) => {
        if (error && error?.message && error?.message.includes('ETH balance')) {
          setHasEnoughCurrency(false)
        } else {
          setTransactionError(error)
          mutateCollection()
          mutateTokens()
          fetchPath(paymentCurrency, paymentTokens)
        }
        setBuyStep(BuyStep.Checkout)
        setStepData(null)
        setSteps(null)
      })
  }, [
    token,
    orderId,
    executionMethod,
    feesOnTopBps,
    feesOnTopUsd,
    quantity,
    normalizeRoyalties,
    is1155,
    client,
    rendererChain,
    rendererChain,
    totalIncludingFees,
    wallet,
    paymentCurrency,
    usePermit,
    buyResponseFees,
    executionMethod,
    mutateTokens,
    mutateCollection,
    onConnectWallet,
  ])

  useEffect(() => {
    if ((!path || (path && path.length === 0)) && !isFetchingPath) {
      setBuyStep(BuyStep.Unavailable)
    } else {
      setBuyStep(BuyStep.Checkout)
    }
  }, [path, isFetchingPath])

  useEffect(() => {
    let totalFees = 0n

    if (
      paymentCurrency?.currencyTotalRaw &&
      paymentCurrency.currencyTotalRaw > 0n
    ) {
      let currencyTotalRawMinusRelayerFees = paymentCurrency?.currencyTotalRaw

      // if relayer fees, subtract from currencyTotalRaw
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

      setTotalIncludingFees(paymentCurrency?.currencyTotalRaw + totalFees)
      setAverageUnitPrice(paymentCurrency?.currencyTotalRaw / BigInt(quantity))
    } else {
      setTotalIncludingFees(0n)
      setAverageUnitPrice(0n)
    }
  }, [
    feesOnTopBps,
    feesOnTopUsd,
    usdPriceRaw,
    feeOnTop,
    quantity,
    paymentCurrency,
    buyResponseFees,
  ])

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
    axios.defaults.headers.common['x-rkui-context'] = ''
  }, [totalIncludingFees, paymentCurrency])

  useEffect(() => {
    if (!open) {
      setBuyStep(BuyStep.Checkout)
      setTransactionError(null)
      setStepData(null)
      setSteps(null)
      setQuantity(1)
      setPath(undefined)
      axios.defaults.headers.common['x-rkui-context'] = ''
      _setPaymentCurrency(undefined)
      setBuyResponseFees(undefined)
    } else {
      axios.defaults.headers.common['x-rkui-context'] = 'buyModalRenderer'
      setQuantity(defaultQuantity || 1)
    }
  }, [open])

  useEffect(() => {
    if (quantityRemaining > 0 && quantity > quantityRemaining) {
      setQuantity(quantityRemaining)
    }
  }, [quantityRemaining, quantity])

  return (
    <>
      {children({
        loading:
          !token || !path || (!(paymentTokens.length > 0) && path.length > 0),
        isFetchingPath,
        tokenData,
        collection,
        quantityAvailable: quantityRemaining || 1,
        paymentCurrency,
        paymentTokens,
        totalIncludingFees,
        averageUnitPrice,
        feeOnTop,
        buyStep,
        transactionError,
        hasEnoughCurrency,
        addFundsLink,
        feeUsd,
        totalUsd,
        usdPrice,
        balance: paymentCurrency?.balance
          ? BigInt(paymentCurrency.balance)
          : undefined,
        address: address,
        blockExplorerBaseUrl,
        blockExplorerBaseName,
        steps,
        stepData,
        path,
        quantity,
        isConnected: wallet !== undefined,
        isOwner,
        setPaymentCurrency,
        setQuantity,
        setBuyStep,
        buyToken,
      })}
    </>
  )
}
