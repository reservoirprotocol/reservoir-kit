import { erc20ABI, useBalance, useContractReads } from 'wagmi'
import { Address, formatUnits, parseUnits, zeroAddress } from 'viem'
import { useReservoirClient, useCurrencyConversions } from '.'
import { useMemo } from 'react'
import { ReservoirChain } from '@reservoir0x/reservoir-sdk'
import { PaymentToken } from '@reservoir0x/reservoir-sdk/src/utils/paymentTokens'
import { formatBN } from '../lib/numbers'

export type EnhancedCurrency =
  | NonNullable<ReservoirChain['paymentTokens']>[0] & {
      usdPrice?: number
      usdPriceRaw?: bigint
      usdTotalPriceRaw?: bigint
      usdTotalFormatted?: string // @TODO: confirm this is needed
      balance?: string | number | bigint
      currencyTotalRaw?: bigint
      currencyTotalFormatted?: string // @TODO: confirm this is needed
    }

export default function (
  open: boolean,
  address: Address,
  preferredCurrency: PaymentToken,
  preferredCurrencyTotalPrice: bigint,
  chainId?: number
) {
  console.log('preferredCurrency: ', preferredCurrency)
  console.log('preferredCurrencyTotalPrice: ', preferredCurrencyTotalPrice)
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

  const nativeBalance = useBalance({
    address: open ? address : undefined,
    chainId: chainId,
    enabled: open,
  })

  const preferredCurrencyConversions = useCurrencyConversions(
    preferredCurrency?.address,
    chain,
    open ? allPaymentTokens : undefined
  )

  const paymentTokens = useMemo(() => {
    if (!open) {
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
                nonNativeCurrency.coinGeckoId === currency.coinGeckoId
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

        console.log('conversion data: ', conversionData, currency?.name)

        // Example if the price of eth is 1600 usdc
        // 100000000 (value you want to convert) * 1000000000000000000 (eth) / 1600000000 (usd)

        const currencyTotalRaw = conversionData?.conversion
          ? (preferredCurrencyTotalPrice * parseUnits('1', currency.decimals)) /
            parseUnits(
              conversionData?.conversion?.toString(),
              preferredCurrency.decimals
            )
          : undefined

        const currencyTotalFormatted = currencyTotalRaw
          ? formatUnits(currencyTotalRaw, currency.decimals)
          : undefined

        const currencyUnit = BigInt(10 ** currency.decimals)
        const usdUnit = BigInt(10 ** 6)

        const usdPrice = Number(conversionData?.usd ?? 0)
        const usdPriceRaw = BigInt(Math.round(Number(usdPrice) * 10 ** 6))
        const usdTotalPriceRaw = usdPriceRaw
          ? (usdUnit * currencyUnit) / usdPriceRaw
          : 0n
        const usdTotalFormatted = formatBN(usdTotalPriceRaw, 6)

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
