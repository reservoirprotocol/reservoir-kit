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
  useChainCurrency,
} from '../../hooks'
import { useAccount, useWalletClient } from 'wagmi'
import { getNetwork, switchNetwork } from 'wagmi/actions'
import {
  BuyPath,
  Execute,
  LogLevel,
  ReservoirClientActions,
  ReservoirWallet,
} from '@reservoir0x/reservoir-sdk'
import { Address, WalletClient, formatUnits, zeroAddress } from 'viem'
import { customChains } from '@reservoir0x/reservoir-sdk'
import * as allChains from 'viem/chains'
import usePaymentTokens, {
  EnhancedCurrency,
} from '../../hooks/usePaymentTokens'
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
type BuyTokenOptions = NonNullable<
  Parameters<ReservoirClientActions['buyToken']>['0']['options']
>

type ChildrenProps = {
  loading: boolean
  token?: Token
  collection?: NonNullable<ReturnType<typeof useCollections>['data']>[0]
  listing?: NonNullable<ReturnType<typeof useListings>['data']>[0]
  quantityAvailable: number
  averageUnitPrice: bigint
  paymentCurrency?: EnhancedCurrency
  paymentTokens: EnhancedCurrency[]
  totalPrice: bigint
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
  tokenId?: string
  chainId?: number
  defaultQuantity?: number
  collectionId?: string
  orderId?: string
  feesOnTopBps?: string[] | null
  feesOnTopUsd?: string[] | null
  normalizeRoyalties?: boolean
  onConnectWallet: () => void
  children: (props: ChildrenProps) => ReactNode
  walletClient?: ReservoirWallet | WalletClient
  usePermit?: boolean
}

export const BuyModalRenderer: FC<Props> = ({
  open,
  tokenId,
  chainId,
  collectionId,
  orderId,
  feesOnTopBps,
  defaultQuantity,
  feesOnTopUsd,
  normalizeRoyalties,
  onConnectWallet,
  children,
  walletClient,
  usePermit,
}) => {
  const [totalPrice, setTotalPrice] = useState(0n)
  const [totalIncludingFees, setTotalIncludingFees] = useState(0n)
  const [averageUnitPrice, setAverageUnitPrice] = useState(0n)
  const [path, setPath] = useState<BuyPath>([])
  const [isFetchingPath, setIsFetchingPath] = useState(false)
  const [feeOnTop, setFeeOnTop] = useState(0n)
  const [buyStep, setBuyStep] = useState<BuyStep>(BuyStep.Checkout)
  const [transactionError, setTransactionError] = useState<Error | null>()
  const [hasEnoughCurrency, setHasEnoughCurrency] = useState(true)
  const [stepData, setStepData] = useState<BuyModalStepData | null>(null)
  const [steps, setSteps] = useState<Execute['steps'] | null>(null)
  const [quantity, setQuantity] = useState(1)

  const client = useReservoirClient()
  const currentChain = client?.currentChain()
  const providerOptionsContext = useContext(ProviderOptionsContext)

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

  const chainCurrency = useChainCurrency(rendererChain?.id)
  const blockExplorerBaseUrl =
    wagmiChain?.blockExplorers?.default?.url || 'https://etherscan.io'
  const blockExplorerBaseName =
    wagmiChain?.blockExplorers?.default?.name || 'Etherscan'

  const contract = collectionId ? collectionId?.split(':')[0] : undefined

  const { address } = useAccount()

  const [_paymentCurrency, setPaymentCurrency] = useState<
    EnhancedCurrency | undefined
  >(undefined)

  const paymentTokens = usePaymentTokens(
    open,
    address as Address,
    _paymentCurrency ?? chainCurrency,
    totalIncludingFees,
    rendererChain?.id,
    false,
    true
  )

  const paymentCurrency = paymentTokens?.find(
    (paymentToken) =>
      paymentToken?.address === _paymentCurrency?.address &&
      paymentToken?.chainId === _paymentCurrency?.chainId
  )

  const { data: tokens, mutate: mutateTokens } = useTokens(
    open && {
      tokens: [`${contract}:${tokenId}`],
      includeLastSale: true,
      includeQuantity: true,
      normalizeRoyalties,
      displayCurrency: paymentCurrency?.address,
    },
    {
      revalidateFirstPage: true,
    },
    rendererChain?.id
  )

  const { data: collections, mutate: mutateCollection } = useCollections(
    open && {
      id: collectionId,
      normalizeRoyalties,
    },
    {},
    rendererChain?.id
  )

  const [token, setToken] = useState<Token | undefined>(undefined)

  useEffect(() => {
    // Only update the token if there's new data from the tokens hook
    if (tokens && tokens.length > 0) {
      setToken(tokens[0])
    }
  }, [tokens])

  const collection = collections && collections[0] ? collections[0] : undefined
  const is1155 = token?.token?.kind === 'erc1155'
  const isOwner = token?.token?.owner?.toLowerCase() === address?.toLowerCase()

  const {
    data: listingsData,
    mutate: mutateListings,
    isValidating: isValidatingListing,
  } = useListings(
    {
      token: `${contract}:${tokenId}`,
      ids: orderId,
      normalizeRoyalties,
      status: 'active',
      limit: 1,
      sortBy: 'price',
      displayCurrency: paymentCurrency?.address,
    },
    {
      revalidateFirstPage: true,
    },
    open && orderId && orderId.length > 0 ? true : false,
    rendererChain?.id
  )

  const listing = useMemo(
    () => listingsData.find((listing) => listing.maker !== address),
    [listingsData]
  )

  const quantityRemaining = useMemo(() => {
    if (orderId) {
      return listing?.quantityRemaining || 0
    } else if (is1155) {
      return path
        ? path.reduce((total, pathItem) => total + (pathItem.quantity || 0), 0)
        : 0
    } else {
      return token?.market?.floorAsk?.quantityRemaining || 0
    }
  }, [listing, token, path, is1155, orderId])

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

  const fetchPath = useCallback(() => {
    if (!open || !client || !tokenId || !contract || !is1155 || orderId) {
      setPath(undefined)
      return
    }

    setIsFetchingPath(true)

    const options: BuyTokenOptions = {
      onlyPath: true,
      partial: true,
      currency: paymentCurrency?.address,
      currencyChainId: paymentCurrency?.chainId,
    }

    if (normalizeRoyalties !== undefined) {
      options.normalizeRoyalties = normalizeRoyalties
    }

    client.actions
      .buyToken({
        options,
        chainId: rendererChain?.id,
        items: [
          {
            token: `${contract}:${tokenId}`,
            quantity: 1000,
            fillType: 'trade',
          },
        ],
        wallet: {
          address: async () => {
            return address || zeroAddress
          },
        } as any,
        onProgress: () => {},
        precheck: true,
      })
      .then((response) => {
        if (response && (response as Execute).path) {
          setPath((response as Execute).path)
        } else {
          setPath([])
        }
      })
      .catch((err) => {
        setPath([])
        throw err
      })
      .finally(() => {
        setIsFetchingPath(false)
      })
  }, [
    open,
    client,
    address,
    tokenId,
    contract,
    is1155,
    orderId,
    normalizeRoyalties,
    rendererChain,
    paymentCurrency?.address,
    paymentCurrency?.chainId,
  ])

  useEffect(() => {
    // ensure the tokens api has been fetched first
    if (token) {
      fetchPath()
    }
  }, [fetchPath, token])

  const getCurrencyDetails = useCallback(() => {
    if (orderId) {
      return {
        currency: listing?.price?.currency?.contract,
        decimals: listing?.price?.currency?.decimals,
        symbol: listing?.price?.currency?.symbol,
        chainId: rendererChain?.id || 1,
      }
    } else if (is1155) {
      return {
        currency: path?.[0]?.currency,
        decimals: path?.[0]?.currencyDecimals,
        symbol: path?.[0]?.currencySymbol,
        chainId: rendererChain?.id || 1,
      }
    } else {
      return {
        currency: token?.market?.floorAsk?.price?.currency?.contract,
        decimals: token?.market?.floorAsk?.price?.currency?.decimals,
        symbol: token?.market?.floorAsk?.price?.currency?.symbol,
        chainId: rendererChain?.id || 1,
      }
    }
  }, [orderId, is1155, listing, path, token, rendererChain])

  useEffect(() => {
    if (
      !paymentTokens[0] ||
      paymentCurrency ||
      !token ||
      (orderId && !listing) ||
      (is1155 && !path)
    ) {
      return
    }

    const { currency, decimals, symbol, chainId } = getCurrencyDetails()

    // Determine whether to include the listing currency unconditionally
    const includeListingCurrency =
      providerOptionsContext.alwaysIncludeListingCurrency !== false

    let selectedCurrency
    if (includeListingCurrency && currency) {
      selectedCurrency = {
        address: currency.toLowerCase() as Address,
        decimals: decimals || 18,
        symbol: symbol || '',
        chainId: chainId,
      }
    } else {
      selectedCurrency = paymentTokens.find(
        (token) => token.address === currency?.toLowerCase()
      )

      if (!selectedCurrency) {
        selectedCurrency = paymentTokens[0]
      }
    }

    setPaymentCurrency(selectedCurrency)
  }, [
    paymentTokens,
    paymentCurrency,
    orderId,
    is1155,
    listing,
    path,
    token,
    providerOptionsContext.alwaysIncludeListingCurrency,
  ])

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

    if (!tokenId || !collectionId) {
      const error = new Error('Missing tokenId or collectionId')
      setTransactionError(error)
      throw error
    }

    if (!client) {
      const error = new Error('ReservoirClient was not initialized')
      setTransactionError(error)
      throw error
    }

    const contract = collectionId?.split(':')[0]

    let options: BuyTokenOptions = {
      currency: paymentCurrency?.address,
      currencyChainId: paymentCurrency?.chainId,
    }

    if (feesOnTopBps && feesOnTopBps?.length > 0) {
      const fixedFees = feesOnTopBps.map((fullFee) => {
        const [referrer, feeBps] = fullFee.split(':')
        const totalFeeTruncated = totalIncludingFees - feeOnTop
        const fee = Number(totalFeeTruncated * BigInt(feeBps)) / 10000
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
      item.token = `${contract}:${tokenId}`
    }
    items.push(item)

    client.actions
      .buyToken({
        chainId: rendererChain?.id,
        items: items,
        expectedPrice: {
          [paymentCurrency?.address || zeroAddress]: {
            raw: totalPrice,
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
          if (orderId) {
            mutateListings()
          }
          mutateCollection()
          mutateTokens()
          fetchPath()
        }
        setBuyStep(BuyStep.Checkout)
        setStepData(null)
        setSteps(null)
      })
  }, [
    tokenId,
    collectionId,
    orderId,
    feesOnTopBps,
    feesOnTopUsd,
    quantity,
    normalizeRoyalties,
    is1155,
    client,
    totalPrice,
    rendererChain,
    rendererChain,
    totalIncludingFees,
    wallet,
    paymentCurrency?.address,
    paymentCurrency?.chainId,
    usePermit,
    mutateListings,
    mutateTokens,
    mutateCollection,
    onConnectWallet,
  ])

  useEffect(() => {
    if (
      !token ||
      (orderId && !listing && isValidatingListing) ||
      (is1155 && !path && isFetchingPath) ||
      (!is1155 && isOwner)
    ) {
      setBuyStep(BuyStep.Unavailable)
    } else if (!orderId && !is1155 && !token?.market?.floorAsk?.price) {
      setBuyStep(BuyStep.Unavailable)
    } else {
      setBuyStep(BuyStep.Checkout)
    }
  }, [
    listing,
    path,
    isValidatingListing,
    isFetchingPath,
    is1155,
    orderId,
    token,
  ])

  useEffect(() => {
    if (quantity === -1) return
    if (
      !token ||
      (orderId && !listing && isValidatingListing) ||
      (is1155 && !path && isFetchingPath) ||
      (!is1155 && isOwner)
    ) {
      setBuyStep(BuyStep.Unavailable)
      setTotalPrice(0n)
      setTotalIncludingFees(0n)
      setAverageUnitPrice(0n)
      return
    }

    let total = 0n
    if (orderId) {
      total = BigInt(listing?.price?.amount?.raw || 0) * BigInt(quantity)
    } else if (is1155) {
      let orders: Record<string, number> = {}
      let orderCurrencyTotal = 0n
      let totalQuantity = 0
      if (path && path.length > 0) {
        for (let i = 0; i < path.length; i++) {
          const pathItem = path[i]
          const pathQuantity = pathItem.quantity || 0
          const pathPrice = BigInt(
            (pathItem?.currency?.toLowerCase() !== paymentCurrency?.address
              ? pathItem?.buyInRawQuote
              : pathItem?.totalRawPrice) || 0
          )

          const listingId = pathItem.orderId
          if (!pathItem?.currency || !listingId) {
            continue
          }
          const quantityLeft = quantity - totalQuantity

          let quantityToTake = 0
          if (quantityLeft >= pathQuantity) {
            quantityToTake = pathQuantity
          } else {
            quantityToTake = quantityLeft
          }

          orderCurrencyTotal += pathPrice * BigInt(quantityToTake)
          orders[listingId] = quantityToTake
          totalQuantity += quantityToTake

          if (totalQuantity === quantity) {
            break
          }
        }
        total = orderCurrencyTotal
      }
    } else if (token?.market?.floorAsk?.price) {
      total = BigInt(token.market.floorAsk.price?.amount?.raw || 0)
    }
    let totalFees = 0n

    if (total > 0) {
      if (feesOnTopBps && feesOnTopBps.length > 0) {
        const fees = feesOnTopBps.reduce((totalFees, feeOnTop) => {
          const [_, fee] = feeOnTop.split(':')
          return totalFees + (BigInt(fee) * total) / 10000n
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

      setTotalPrice(total)
      setTotalIncludingFees(total + totalFees)
      setAverageUnitPrice(total / BigInt(quantity))
    } else {
      setTotalIncludingFees(0n)
      setTotalPrice(0n)
      setAverageUnitPrice(0n)
    }
  }, [
    listing,
    path,
    isValidatingListing,
    isFetchingPath,
    is1155,
    orderId,
    feesOnTopBps,
    feesOnTopUsd,
    usdPrice,
    feeOnTop,
    quantity,
    token,
    chainCurrency.address,
    isOwner,
    paymentCurrency,
  ])

  useEffect(() => {
    if (
      paymentCurrency?.balance != undefined &&
      paymentCurrency?.currencyTotalRaw != undefined &&
      BigInt(paymentCurrency?.balance) < paymentCurrency?.currencyTotalRaw
    ) {
      setHasEnoughCurrency(false)
    } else {
      setHasEnoughCurrency(true)
    }
  }, [totalIncludingFees, paymentCurrency])

  useEffect(() => {
    if (!open) {
      setBuyStep(BuyStep.Checkout)
      setTransactionError(null)
      setStepData(null)
      setSteps(null)
      setQuantity(1)
      setPath(undefined)
      setPaymentCurrency(undefined)
      setToken(undefined)
    } else {
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
          (!listing && isValidatingListing) ||
          !token ||
          isFetchingPath ||
          (is1155 && !path && !orderId),
        token,
        collection,
        listing,
        quantityAvailable: quantityRemaining || 1,
        paymentCurrency,
        paymentTokens,
        totalPrice,
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
