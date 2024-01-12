import { erc20ABI, useContractReads } from 'wagmi'
import { fetchBalance } from 'wagmi/actions'
import { Address, formatUnits, parseUnits, zeroAddress } from 'viem'
import { useContext, useMemo } from 'react'
import {
  useReservoirClient,
  useCurrencyConversions,
  useSolverCapacity,
} from '.'
import { ReservoirChain, PaymentToken } from '@reservoir0x/reservoir-sdk'
import useSWR from 'swr'
import { ProviderOptionsContext } from '../ReservoirKitProvider'

export type EnhancedCurrency =
  | NonNullable<ReservoirChain['paymentTokens']>[0] & {
      usdPrice?: number
      usdPriceRaw?: bigint
      usdTotalPriceRaw?: bigint
      usdTotalFormatted?: string
      balance?: string | number | bigint
      currencyTotalRaw?: bigint
      currencyTotalFormatted?: string
      maxItems?: number
      maxPricePerItem?: bigint
    }

const fetchNativeBalances = async (
  address: Address,
  tokens?: PaymentToken[]
) => {
  const balancePromises = tokens?.map((currency) =>
    fetchBalance({
      address: address,
      chainId: currency?.chainId,
    })
  )

  const settledResults = balancePromises
    ? await Promise.allSettled(balancePromises)
    : []

  return settledResults.map((result) => {
    return result.status === 'fulfilled' ? result.value : null
  })
}

export default function (
  enabled: boolean,
  address: Address,
  preferredCurrency: PaymentToken,
  preferredCurrencyTotalPrice: bigint,
  chainId?: number,
  nativeOnly?: boolean,
  crossChainDisabled?: boolean,
  listingCurrency?: EnhancedCurrency
) {
  const client = useReservoirClient()
  const providerOptions = useContext(ProviderOptionsContext)
  const chain =
    chainId !== undefined
      ? client?.chains.find((chain) => chain.id === chainId)
      : client?.currentChain()

  const includeListingCurrency =
    providerOptions.alwaysIncludeListingCurrency !== false

  const allPaymentTokens = useMemo(() => {
    let paymentTokens = chain?.paymentTokens

    if (includeListingCurrency) {
      const listingCurrencyAlreadyExists = paymentTokens?.some(
        (token) =>
          token?.address?.toLowerCase() ===
            listingCurrency?.address?.toLowerCase() &&
          token.chainId === listingCurrency?.chainId
      )
      if (!listingCurrencyAlreadyExists && listingCurrency) {
        paymentTokens?.push(listingCurrency)
      }
    }

    if (crossChainDisabled) {
      paymentTokens = paymentTokens?.filter(
        (token) => token.chainId === chain?.id
      )
    }

    if (nativeOnly) {
      paymentTokens = paymentTokens?.filter(
        (token) => token.address === zeroAddress
      )
    }

    if (
      !paymentTokens
        ?.map((currency) => currency?.address?.toLowerCase())
        .includes(preferredCurrency?.address?.toLowerCase())
    ) {
      paymentTokens?.push(preferredCurrency)
    }
    return paymentTokens
  }, [
    chain?.paymentTokens,
    preferredCurrency.address,
    crossChainDisabled,
    nativeOnly,
    listingCurrency,
    includeListingCurrency,
  ])

  const nonNativeCurrencies = useMemo(() => {
    return allPaymentTokens?.filter(
      (currency) => currency.address !== zeroAddress
    )
  }, [
    allPaymentTokens,
    chain?.paymentTokens,
    preferredCurrency.address,
    crossChainDisabled,
    nativeOnly,
    listingCurrency,
    includeListingCurrency,
  ])

  const nativeCurrencies = useMemo(() => {
    return allPaymentTokens?.filter(
      (currency) => currency.address === zeroAddress
    )
  }, [
    allPaymentTokens,
    chain?.paymentTokens,
    preferredCurrency.address,
    crossChainDisabled,
    nativeOnly,
    listingCurrency,
    includeListingCurrency,
  ])

  const { data: nonNativeBalances } = useContractReads({
    contracts: enabled
      ? nonNativeCurrencies?.map((currency) => ({
          abi: erc20ABI,
          address: currency.address as `0x${string}`,
          chainId: chainId,
          functionName: 'balanceOf',
          args: [address],
        }))
      : [],
    enabled,
    allowFailure: false,
  })

  const { data: nativeBalances } = useSWR(
    enabled ? address : undefined,
    () => fetchNativeBalances(address, nativeCurrencies),
    {
      revalidateOnFocus: false,
    }
  )

  const crosschainChainIds = useMemo(() => {
    if (crossChainDisabled) {
      return []
    } else {
      return (
        allPaymentTokens
          ?.filter((token) => token?.chainId !== chain?.id)
          ?.map((token) => token?.chainId) ?? []
      )
    }
  }, [allPaymentTokens, crossChainDisabled])

  const { data: solverCapacity } = useSolverCapacity(chain?.id, enabled)

  const preferredCurrencyConversions = useCurrencyConversions(
    preferredCurrency?.address,
    chain,
    enabled ? allPaymentTokens : undefined
  )

  const paymentTokens = useMemo(() => {
    if (!enabled) {
      return []
    }

    return allPaymentTokens
      ?.map((currency, i) => {
        let balance: string | number | bigint = 0n
        if (currency.address === zeroAddress) {
          const index =
            nativeCurrencies?.findIndex(
              (nativeCurrency) =>
                nativeCurrency.symbol === currency.symbol &&
                nativeCurrency.chainId === currency.chainId
            ) || 0

          balance = nativeBalances?.[index]?.value ?? 0n
        } else {
          const index =
            nonNativeCurrencies?.findIndex(
              (nonNativeCurrency) =>
                nonNativeCurrency.symbol === currency.symbol &&
                nonNativeCurrency?.address?.toLowerCase() ===
                  currency?.address?.toLowerCase()
            ) || 0
          balance =
            nonNativeBalances &&
            nonNativeBalances[index] &&
            (typeof nonNativeBalances[index] === 'string' ||
              typeof nonNativeBalances[index] === 'number' ||
              typeof nonNativeBalances[index] === 'bigint')
              ? (nonNativeBalances[index] as string | number | bigint)
              : 0n
        }

        const conversionData = preferredCurrencyConversions?.data?.[i]

        const currencyTotalRaw =
          conversionData?.conversion && conversionData?.conversion !== '0'
            ? (preferredCurrencyTotalPrice *
                parseUnits('1', currency.decimals)) /
              parseUnits(
                conversionData?.conversion?.toString(),
                preferredCurrency.decimals
              )
            : undefined

        const currencyTotalFormatted = currencyTotalRaw
          ? formatUnits(currencyTotalRaw, currency.decimals)
          : undefined

        const usdPrice = Number(conversionData?.usd ?? 0)
        const usdPriceRaw = parseUnits(usdPrice.toString(), 6)
        const usdTotalPriceRaw = conversionData?.usd
          ? (preferredCurrencyTotalPrice * usdPriceRaw) /
            parseUnits('1', preferredCurrency?.decimals)
          : undefined

        const usdTotalFormatted = usdTotalPriceRaw
          ? formatUnits(usdTotalPriceRaw, 6)
          : undefined

        let maxItems: EnhancedCurrency['maxItems'] = undefined
        let maxPricePerItem: EnhancedCurrency['maxPricePerItem'] = undefined

        if (
          !crossChainDisabled &&
          crosschainChainIds?.length > 0 &&
          solverCapacity &&
          currency.chainId !== chain?.id
        ) {
          maxItems = solverCapacity.maxItems
          maxPricePerItem = BigInt(solverCapacity.maxPricePerItem)
        }

        return {
          ...currency,
          address: currency?.address?.toLowerCase(),
          usdPrice,
          usdPriceRaw,
          usdTotalPriceRaw,
          usdTotalFormatted,
          balance,
          currencyTotalRaw,
          currencyTotalFormatted,
          maxItems,
          maxPricePerItem,
        }
      })
      .sort((a, b) => {
        // If user has enough balance in the listing currency, return first. Otherwise sort currencies by balance and chainId

        // User has enough balance in listing currency
        if (
          listingCurrency &&
          a.address === listingCurrency.address &&
          a.chainId === listingCurrency.chainId &&
          a.currencyTotalRaw &&
          BigInt(a.balance) > a.currencyTotalRaw
        ) {
          return -1
        }
        if (
          listingCurrency &&
          b.address === listingCurrency.address &&
          b.chainId === listingCurrency.chainId &&
          b.currencyTotalRaw &&
          BigInt(b.balance) > b.currencyTotalRaw
        ) {
          return 1
        }

        // User has enough balance in non-listing currency
        if (a.currencyTotalRaw && BigInt(a.balance) > a.currencyTotalRaw) {
          return -1
        }

        if (b.currencyTotalRaw && BigInt(b.balance) > b.currencyTotalRaw) {
          return 1
        }

        // Currency is the listing currency
        if (
          listingCurrency &&
          a.address === listingCurrency.address &&
          a.chainId === listingCurrency.chainId
        ) {
          return -1
        }

        if (
          listingCurrency &&
          b.address === listingCurrency.address &&
          b.chainId === listingCurrency.chainId
        ) {
          return 1
        }

        // Otherwise sort by usdPrice and chaindId
        if (Number(b.usdPrice) === Number(a.usdPrice)) {
          if (
            a.chainId === preferredCurrency.chainId &&
            b.chainId !== preferredCurrency.chainId
          ) {
            return -1
          }
          if (
            a.chainId !== preferredCurrency.chainId &&
            b.chainId === preferredCurrency.chainId
          ) {
            return 1
          }
        }
        return Number(b.usdPrice ?? 0) - Number(a.usdPrice ?? 0)
      }) as EnhancedCurrency[]
  }, [
    address,
    preferredCurrencyConversions,
    preferredCurrency.address,
    preferredCurrencyTotalPrice,
    chainId,
    allPaymentTokens,
    nonNativeBalances,
    nativeBalances,
    listingCurrency,
  ])

  return paymentTokens
}
