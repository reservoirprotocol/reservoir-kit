import { erc20ABI, useBalance, useContractReads } from 'wagmi'
import { Address, zeroAddress } from 'viem'
import { useReservoirClient, useCurrencyConversions } from '.'
import { useMemo } from 'react'
import { ReservoirChain } from '@reservoir0x/reservoir-sdk'
import { PaymentToken } from '@reservoir0x/reservoir-sdk/src/utils/paymentTokens'
import { formatBN } from '../lib/numbers'

export type EnhancedCurrency =
  | NonNullable<ReservoirChain['paymentTokens']>[0] & {
      usdPrice?: string
      usdPriceRaw?: bigint
      usdTotal?: string
      balance?: string | number | bigint
      currencyTotal?: bigint
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

        if (conversionData && preferredCurrency?.decimals) {
          debugger
        }
        let currencyTotal

        if (
          preferredCurrencyTotalPrice &&
          conversionData?.conversion != undefined &&
          Number(conversionData?.conversion) > 0
        ) {
          const decimalDifference = Math.abs(
            currency.decimals - preferredCurrency.decimals
          )
          const unitDifference = BigInt(10 ** decimalDifference)

          const conversionRateDecimals = (
            conversionData?.conversion.split('.')[1] || ''
          ).length

          const currencyConversion = BigInt(
            Math.round(
              Number(conversionData.conversion) *
                10 ** preferredCurrency.decimals
            )
          )

          currencyTotal =
            (preferredCurrencyTotalPrice * (unitDifference || 1n)) /
            currencyConversion

          if (currencyTotal === 0n) {
            currencyTotal = 1n
          }
        } else {
          currencyTotal = 0n
        }

        const currencyUnit = BigInt(10 ** currency.decimals)
        const usdUnit = BigInt(10 ** 6)

        const usdPrice = conversionData?.usd || '0'
        const usdPriceRaw = Math.round(Number(usdPrice) * 10 ** 6)
        const usdTotal = usdPriceRaw
          ? formatBN((usdUnit * currencyUnit) / BigInt(usdPriceRaw), 6)
          : '0'

        return {
          ...currency,
          address: currency.address.toLowerCase(),
          usdPrice,
          usdPriceRaw: BigInt(usdPriceRaw),
          usdTotal,
          balance,
          currencyTotal,
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
