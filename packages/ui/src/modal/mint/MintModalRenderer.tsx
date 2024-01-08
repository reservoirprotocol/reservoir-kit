import React, {
  FC,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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
import usePaymentTokensv2, {
  EnhancedCurrency,
} from '../../hooks/usePaymentTokensv2'

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
  isFetchingPath: boolean
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
  totalIncludingFees: bigint
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
  const [isFetchingPath, setIsFetchingPath] = useState(false)
  const [fetchedInitialOrders, setFetchedInitialOrders] = useState(false)
  const [itemAmount, setItemAmount] = useState<number>(1)
  const [maxItemAmount, setMaxItemAmount] = useState<number>(1)
  const [transactionError, setTransactionError] = useState<Error | null>()
  const [fetchMintPathError, setFetchMintPathError] = useState<Error | null>()
  const [totalIncludingFees, setTotalIncludingFees] = useState(0n)
  const [hasEnoughCurrency, setHasEnoughCurrency] = useState(true)
  const [feeOnTop, setFeeOnTop] = useState(0n)
  const [mintResponseFees, setMintResponseFees] = useState<
    MintResponses['fees'] | undefined
  >(undefined)

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
  const includeListingCurrency =
    providerOptions.alwaysIncludeListingCurrency !== false
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
    nativeOnly: true,
    chainId: rendererChain?.id,
    crossChainDisabled: false,
  })

  const paymentCurrency = paymentTokens?.find(
    (paymentToken) =>
      paymentToken?.address === _paymentCurrency?.address &&
      paymentToken?.chainId === _paymentCurrency?.chainId
  )

  const usdPrice = paymentCurrency?.usdPrice || 0
  const usdPriceRaw = paymentCurrency?.usdPriceRaw || 0n
  const feeUsd = formatUnits(
    feeOnTop * usdPriceRaw,
    (paymentCurrency?.decimals || 18) + 6
  )

  // Fetch mint path
  const fetchMintPath = useCallback(
    (paymentCurrency: EnhancedCurrency | undefined) => {
      if (!open || !client) {
        return
      }

      setIsFetchingPath(true)

      let options: MintTokenOptions = {
        partial: true,
        onlyPath: true,
        currencyChainId: paymentCurrency?.chainId,
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

      return client?.actions
        .mintToken({
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

            if (data.fees) {
              setMintResponseFees(data.fees)
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
          }
        })
        .catch((err) => {
          setOrders([])
          setFetchMintPathError(err)
          throw err
        })
        .finally(() => {
          setFetchedInitialOrders(true)
          setIsFetchingPath(false)
        })
    },
    [
      open,
      address,
      client,
      wallet,
      rendererChain,
      contract,
      tokenId,
      collection,
      token,
      tokenData?.token?.tokenId,
      paymentCurrency?.chainId,
      is1155,
      feesOnTopBps,
      feesOnTopUsd,
    ]
  )

  useEffect(() => {
    if (open && (collection || tokenData) && !paymentCurrency) {
      fetchMintPath(paymentCurrency)
    }
  }, [fetchMintPath, open, collection, tokenData, paymentCurrency])

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
            fetchMintPath(newValue)?.catch((err) => {
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
          fetchMintPath(value)?.catch((err) => {
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
    [fetchMintPath, _setPaymentCurrency, paymentCurrency]
  )

  useEffect(() => {
    let totalFees = 0n
    if (
      paymentCurrency?.currencyTotalRaw &&
      paymentCurrency.currencyTotalRaw > 0n
    ) {
      let currencyTotalRawMinusRelayerFees = paymentCurrency?.currencyTotalRaw

      // if there is a relayer fee, subtract from currencyTotalRaw
      if (mintResponseFees?.relayer?.amount?.raw) {
        const relayerFees = BigInt(mintResponseFees?.relayer?.amount?.raw ?? 0)
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
    } else {
      setTotalIncludingFees(0n)
    }
  }, [
    feesOnTopBps,
    feesOnTopUsd,
    usdPriceRaw,
    feeOnTop,
    itemAmount,
    paymentCurrency,
    mintResponseFees,
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

  // Set initial payment currency
  useEffect(() => {
    if (paymentTokens[0] && !paymentCurrency && fetchedInitialOrders) {
      if (!includeListingCurrency) {
        _setPaymentCurrency(paymentTokens[0])
      } else {
        _setPaymentCurrency(chainCurrency)
      }
    }
  }, [paymentTokens, paymentCurrency, fetchedInitialOrders])

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
      _setPaymentCurrency(undefined)
      setStepData(null)
      setMintResponseFees(undefined)
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

        let totalFeeTruncated = totalIncludingFees - feeOnTop

        if (mintResponseFees?.relayer?.amount?.raw) {
          totalFeeTruncated -= BigInt(
            mintResponseFees?.relayer?.amount?.raw ?? 0
          )
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

    setMintStep(MintStep.Approving)

    client.actions
      .mintToken({
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
            raw: totalIncludingFees,
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
        fetchMintPath(paymentCurrency)
      })
  }, [
    client,
    wallet,
    address,
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
    paymentCurrency?.currencyTotalRaw,
    totalIncludingFees,
    tokenData?.token?.tokenId,
    collection?.id,
    collectionContract,
    mintResponseFees,
    usdPriceRaw,
  ])

  return (
    <>
      {children({
        loading:
          isFetchingCollections ||
          (!isFetchingCollections && collection && !fetchedInitialOrders) ||
          ((token !== undefined || isSingleToken1155) && !tokenData) ||
          !(paymentTokens.length > 0),
        isFetchingPath,
        collection,
        token: tokenData,
        orders,
        totalIncludingFees,
        feeOnTop,
        feeUsd,
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
