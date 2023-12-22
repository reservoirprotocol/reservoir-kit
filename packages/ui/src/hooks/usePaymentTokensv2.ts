import { erc20ABI, useContractReads } from 'wagmi'
import { fetchBalance } from 'wagmi/actions'
import { Address, formatUnits, parseUnits, zeroAddress } from 'viem'
import { useContext, useMemo } from 'react'
import {
  useCurrencyConversions,
  useReservoirClient,
  useSolverCapacity,
} from '.'
import { BuyPath, ReservoirChain } from '@reservoir0x/reservoir-sdk'
import { PaymentToken } from '@reservoir0x/reservoir-sdk'
import useSWR from 'swr'
import { ProviderOptionsContext } from '../ReservoirKitProvider'
import { Currency } from '../types/Currency'

export type EnhancedCurrency =
  | NonNullable<ReservoirChain['paymentTokens']>[0] & {
      usdPrice?: number
      usdPriceRaw?: bigint
      usdTotalPriceRaw?: bigint
      usdTotalFormatted?: string
      usdBalanceRaw?: bigint
      balance?: string | number | bigint
      currencyTotalRaw?: bigint
      currencyTotalFormatted?: string
      maxItems?: number
      capacityPerRequest?: bigint
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

export default function (options: {
  open: boolean
  address: Address
  quantityToken: Record<string, number>
  path?: BuyPath
  nativeOnly?: boolean
  chainId?: number
  crossChainDisabled?: boolean
}) {
  const {
    open,
    address,
    quantityToken,
    path,
    nativeOnly,
    chainId,
    crossChainDisabled,
  } = options

  const client = useReservoirClient()
  const providerOptions = useContext(ProviderOptionsContext)
  const chain =
    chainId !== undefined
      ? client?.chains.find((chain) => chain.id === chainId)
      : client?.currentChain()

  const includeListingCurrency =
    providerOptions.alwaysIncludeListingCurrency !== false

  const listingCurrency: Currency | undefined =
    path && path[0] && path[0].currency
      ? {
          contract: path[0].currency,
          decimals: path[0].currencyDecimals || 18,
          symbol: path[0].currencySymbol || '',
        }
      : undefined
  const listingCurrencyChainId =
    path && path[0] && path[0].fromChainId ? path[0].fromChainId : chainId

  const allPaymentTokens = useMemo(() => {
    let paymentTokens = chain?.paymentTokens

    if (includeListingCurrency) {
      const listingCurrencyAlreadyExists = paymentTokens?.some(
        (token) =>
          token?.address?.toLowerCase() ===
            listingCurrency?.contract?.toLowerCase() &&
          token.chainId === listingCurrencyChainId
      )
      if (!listingCurrencyAlreadyExists && listingCurrency) {
        paymentTokens?.push({
          ...listingCurrency,
          decimals: listingCurrency.decimals || 18,
          address: listingCurrency.contract as Address,
          chainId: listingCurrencyChainId || 1,
          name: listingCurrency.symbol,
        })
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

    return paymentTokens
  }, [
    chain?.paymentTokens,
    crossChainDisabled,
    nativeOnly,
    includeListingCurrency,
    listingCurrency,
    listingCurrencyChainId,
  ])

  const nonNativeCurrencies = useMemo(() => {
    return allPaymentTokens?.filter(
      (currency) => currency.address !== zeroAddress
    )
  }, [
    allPaymentTokens,
    chain?.paymentTokens,
    crossChainDisabled,
    nativeOnly,
    includeListingCurrency,
  ])

  const nativeCurrencies = useMemo(() => {
    return allPaymentTokens?.filter(
      (currency) => currency.address === zeroAddress
    )
  }, [
    allPaymentTokens,
    chain?.paymentTokens,
    crossChainDisabled,
    nativeOnly,
    includeListingCurrency,
  ])

  const { data: nonNativeBalances } = useContractReads({
    contracts: open
      ? nonNativeCurrencies?.map((currency) => ({
          abi: erc20ABI,
          address: currency.address as `0x${string}`,
          chainId: chainId,
          functionName: 'balanceOf',
          args: [address],
        }))
      : [],
    enabled: open,
    allowFailure: false,
  })

  const { data: nativeBalances } = useSWR(
    open ? address : undefined,
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

  const { data: solverCapacity } = useSolverCapacity(open ? chain : null)

  const preferredCurrencyConversions = useCurrencyConversions(
    path && path[0]
      ? path[0].currency ?? path[0].buyInCurrency ?? undefined
      : undefined,
    chain,
    open ? allPaymentTokens : undefined
  )

  return useMemo(() => {
    if (!open) {
      return []
    }

    const paymentTokens = allPaymentTokens?.reduce(
      (tokens, token, i) => {
        const conversionData = preferredCurrencyConversions?.data?.[i]
        tokens[`${token.address.toLowerCase()}:${token.chainId}`] = {
          total: 0n,
          usdTotal: 0,
          currency: {
            ...token,
            contract: token.address.toLowerCase(),
          },
          chainId: token.chainId,
          conversionData,
        }
        return tokens
      },
      {} as Record<
        string,
        {
          total: bigint
          usdTotal: number
          currency: Currency
          chainId: number
          conversionData?: { conversion?: string; usd?: string }
        }
      >
    )

    if (!paymentTokens) {
      return []
    }

    let totalQuantities: Record<string, number> = {}
    let orders: Record<string, number> = {}

    path?.forEach((pathItem, i) => {
      const tokenKey = `${pathItem.contract}:${pathItem.tokenId}`
      const tokenKeyInsensitive = `${pathItem.contract?.toLowerCase()}:${
        pathItem.tokenId
      }`
      const contractKey = `${pathItem.contract}` //todo: test with sweeping
      const contractKeyInsensitive = `${pathItem.contract?.toLowerCase()}`

      let assetKey = tokenKey
      let totalQuantity = 0
      let requiredQuantity = 0
      //Determine correct key to use
      if (quantityToken[tokenKey] !== undefined) {
        assetKey = tokenKey
      } else if (quantityToken[tokenKeyInsensitive] !== undefined) {
        assetKey = tokenKeyInsensitive
      } else if (quantityToken[contractKey] !== undefined) {
        assetKey = contractKey
      } else if (quantityToken[contractKeyInsensitive] !== undefined) {
        assetKey = contractKeyInsensitive
      }

      totalQuantity = totalQuantities[assetKey] || 0
      requiredQuantity = quantityToken[assetKey] || 0

      //quantity check
      const pathQuantity = pathItem.quantity || 0
      const quantityLeft = requiredQuantity - totalQuantity
      if (totalQuantity === requiredQuantity) {
        return
      }

      let quantityToTake = 0

      if (quantityLeft >= pathQuantity) {
        quantityToTake = pathQuantity
      } else {
        quantityToTake = quantityLeft
      }

      orders[pathItem.orderId as string] = quantityToTake
      totalQuantities[assetKey] = totalQuantity + quantityToTake

      //Total for BuyIn or listing currency
      const currency = pathItem.buyInCurrency
        ? pathItem.buyInCurrency
        : pathItem.currency
      const totalRaw = BigInt(
        pathItem.buyInRawQuote
          ? pathItem.buyInRawQuote
          : pathItem.totalRawPrice ?? 0
      )

      const currencyChainId = pathItem.fromChainId || chainId
      const currencyKey = `${currency?.toLowerCase()}:${currencyChainId}`
      if (paymentTokens[currencyKey]) {
        paymentTokens[currencyKey].total += totalRaw * BigInt(quantityToTake)
      }
    })

    const preferredToken = Object.values(paymentTokens).find(
      (token) => token.total > 0n
    )

    return Object.values(paymentTokens)
      .map((token) => {
        const currency = token.currency

        let maxItems: EnhancedCurrency['maxItems'] = undefined
        let capacityPerRequest: EnhancedCurrency['capacityPerRequest'] =
          undefined

        if (
          !crossChainDisabled &&
          crosschainChainIds?.length > 0 &&
          solverCapacity &&
          token.chainId !== chain?.id &&
          path
        ) {
          maxItems = 0
          for (
            let i = 0;
            i < Math.min(path.length, solverCapacity.maxItems);
            i++
          ) {
            maxItems += path[i].quantity || 0
          }

          capacityPerRequest = BigInt(solverCapacity.capacityPerRequest)
        }

        let balance: string | number | bigint = 0n
        if (currency.contract === zeroAddress) {
          const index =
            nativeCurrencies?.findIndex(
              (nativeCurrency) =>
                nativeCurrency.symbol === currency.symbol &&
                nativeCurrency.chainId === token.chainId
            ) || 0

          balance = nativeBalances?.[index]?.value ?? 0n
        } else {
          const index =
            nonNativeCurrencies?.findIndex(
              (nonNativeCurrency) =>
                nonNativeCurrency.symbol === currency.symbol &&
                nonNativeCurrency?.address?.toLowerCase() ===
                  currency?.contract?.toLowerCase()
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
        const conversionData = token.conversionData
        let currencyTotalRaw = token.total
        if (
          !currencyTotalRaw &&
          (token.currency.contract !== preferredToken?.currency.contract ||
            token.chainId !== preferredToken?.chainId)
        ) {
          currencyTotalRaw =
            conversionData?.conversion &&
            conversionData?.conversion !== '0' &&
            preferredToken?.total
              ? (preferredToken.total *
                  parseUnits('1', currency.decimals ?? 18)) /
                parseUnits(
                  conversionData?.conversion?.toString(),
                  preferredToken.currency.decimals ?? 18
                )
              : 0n
        }

        const currencyTotalFormatted =
          currencyTotalRaw > 0n
            ? formatUnits(currencyTotalRaw, currency?.decimals || 18)
            : undefined

        const usdPrice = Number(conversionData?.usd ?? 0)
        const usdPriceRaw = parseUnits(usdPrice.toString(), 6)
        const usdTotalPriceRaw = conversionData?.usd
          ? ((preferredToken?.total || 0n) * usdPriceRaw) /
            parseUnits('1', preferredToken?.currency?.decimals ?? 18)
          : undefined

        const usdTotalFormatted = usdTotalPriceRaw
          ? formatUnits(usdTotalPriceRaw, 6)
          : undefined
        const usdBalanceRaw =
          conversionData?.usd && typeof balance === 'bigint'
            ? ((balance || 0n) * usdPriceRaw) /
              parseUnits('1', preferredToken?.currency?.decimals ?? 18)
            : undefined

        return {
          ...currency,
          address: token?.currency?.contract?.toLowerCase(),
          usdPrice: token.usdTotal,
          usdPriceRaw,
          usdTotalPriceRaw,
          balance,
          currencyTotalRaw,
          currencyTotalFormatted,
          usdTotalFormatted: usdTotalFormatted,
          usdBalanceRaw: usdBalanceRaw,
          maxItems,
          capacityPerRequest,
          chainId: token.chainId,
        }
      })
      .sort((a, b) => {
        return Number(b.usdBalanceRaw) - Number(a.usdBalanceRaw)
      })
  }, [
    address,
    chainId,
    allPaymentTokens,
    path,
    nonNativeBalances,
    nativeBalances,
    quantityToken,
    listingCurrency,
    listingCurrencyChainId,
    preferredCurrencyConversions,
  ]) as EnhancedCurrency[]
}
