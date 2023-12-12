import { erc20ABI, useContractReads } from 'wagmi'
import { fetchBalance } from 'wagmi/actions'
import { Address, formatUnits, zeroAddress } from 'viem'
import { useContext, useMemo } from 'react'
import { useReservoirClient, useSolverCapacities } from '.'
import { BuyPath, ReservoirChain } from '@reservoir0x/reservoir-sdk'
import { PaymentToken } from '@reservoir0x/reservoir-sdk'
import useSWR from 'swr'
import { ProviderOptionsContext } from '../ReservoirKitProvider'
import { Currency } from 'packages/ui/dist'

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

  const { data: solverCapacityChainIdMap } = useSolverCapacities(
    open ? crosschainChainIds : [],
    chain
  )

  return useMemo(() => {
    if (!open) {
      return []
    }

    const paymentTokens = allPaymentTokens?.reduce(
      (tokens, token) => {
        tokens[`${token.address.toLowerCase()}:${token.chainId}`] = {
          total: 0n,
          usdTotal: 0,
          currency: {
            ...token,
            contract: token.address.toLowerCase(),
          },
          chainId: token.chainId,
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
      requiredQuantity = quantityToken[assetKey]

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
    return Object.values(paymentTokens)
      .map((token) => {
        const currency = token.currency
        const currencyTotalFormatted = token.total
          ? formatUnits(token.total, currency.decimals || 18)
          : undefined

        let maxItems: EnhancedCurrency['maxItems'] = undefined
        let maxPricePerItem: EnhancedCurrency['maxPricePerItem'] = undefined

        if (
          !crossChainDisabled &&
          crosschainChainIds?.length > 0 &&
          solverCapacityChainIdMap &&
          token.chainId !== chain?.id
        ) {
          const solverCapacity = solverCapacityChainIdMap.get(token.chainId)

          if (solverCapacity) {
            maxItems = solverCapacity.maxItems
            if (typeof solverCapacity.maxPricePerItem === 'string') {
              maxPricePerItem = BigInt(solverCapacity.maxPricePerItem)
            }
          }
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

        return {
          ...currency,
          address: token?.currency?.contract?.toLowerCase(),
          usdPrice: token.usdTotal,
          balance,
          currencyTotalRaw: token.total,
          currencyTotalFormatted,
          maxItems,
          maxPricePerItem,
          chainId: token.chainId,
        }
      })
      .sort((a, b) => {
        return Number(b.balance) - Number(a.balance)
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
  ]) as EnhancedCurrency[]
}
