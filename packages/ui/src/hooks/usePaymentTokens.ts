import { erc20ABI, useBalance, useContractReads } from 'wagmi'
import { Address, formatUnits, parseUnits, zeroAddress } from 'viem'
import { useReservoirClient, useCurrencyConversions } from '.'
import { useMemo } from 'react'
import { ReservoirChain } from '@reservoir0x/reservoir-sdk'
import { PaymentToken } from '@reservoir0x/reservoir-sdk/src/utils/paymentTokens'

export type EnhancedCurrency =
  | NonNullable<ReservoirChain['paymentTokens']>[0] & {
      usdPrice?: number
      usdPriceRaw?: bigint
      usdTotalPriceRaw?: bigint
      usdTotalFormatted?: string
      balance?: string | number | bigint
      currencyTotalRaw?: bigint
      currencyTotalFormatted?: string
    }

export default function (
  enabled: boolean,
  address: Address,
  preferredCurrency: PaymentToken,
  preferredCurrencyTotalPrice: bigint,
  chainId?: number
) {
  const client = useReservoirClient()
  const chain =
    chainId !== undefined
      ? client?.chains.find((chain) => chain.id === chainId)
      : client?.currentChain()

  const allPaymentTokens = useMemo(() => {
    let paymentTokens = chain?.paymentTokens

    if (
      !paymentTokens
        ?.map((currency) => currency.address.toLowerCase())
        .includes(preferredCurrency.address.toLowerCase())
    ) {
      paymentTokens?.push(preferredCurrency)
    }
    return paymentTokens
  }, [chain?.paymentTokens, preferredCurrency.address])

  const nonNativeCurrencies = useMemo(() => {
    return allPaymentTokens?.filter(
      (currency) => currency.address !== zeroAddress
    )
  }, [chain?.paymentTokens])

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

  const nativeBalance = useBalance({
    address: enabled ? address : undefined,
    chainId: chainId,
    enabled,
  })

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
          balance = nativeBalance.data?.value || 0n
        } else {
          const index =
            nonNativeCurrencies?.findIndex(
              (nonNativeCurrency) =>
                nonNativeCurrency.symbol === currency.symbol &&
                nonNativeCurrency.address.toLowerCase() ===
                  currency.address.toLowerCase()
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

        return {
          ...currency,
          address: currency.address.toLowerCase(),
          usdPrice,
          usdPriceRaw,
          usdTotalPriceRaw,
          usdTotalFormatted,
          balance,
          currencyTotalRaw,
          currencyTotalFormatted,
        }
      })
      .sort((a, b) => {
        // If user has a balance for the listed currency, return first. Otherwise sort currencies by total usdPrice
        if (a.address === preferredCurrency.address && Number(a.balance) > 0)
          return -1
        if (b.address === preferredCurrency.address && Number(b.balance) > 0)
          return 1
        return Number(b.usdPrice ?? 0) - Number(a.usdPrice ?? 0)
      }) as EnhancedCurrency[]
  }, [
    address,
    preferredCurrency.address,
    preferredCurrencyTotalPrice,
    chainId,
    allPaymentTokens,
    nonNativeBalances,
    nativeBalance,
  ])

  return paymentTokens
}
