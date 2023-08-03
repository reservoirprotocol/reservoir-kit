import { erc20ABI, useBalance, useContractReads } from 'wagmi'
import { Address, zeroAddress } from 'viem'
import { useReservoirClient, useCurrencyConversions } from '.'
import { useMemo } from 'react'
import { ReservoirChain } from '@reservoir0x/reservoir-sdk'
import { PaymentToken } from '@reservoir0x/reservoir-sdk/src/utils/paymentTokens'

export type EnhancedCurrency =
  | NonNullable<ReservoirChain['paymentTokens']>[0] & {
      usdPrice?: number
      usdTotal?: number
      balance?: string | number | bigint
      currencyTotal?: number
    }

export default function (
  open: boolean,
  address: Address,
  preferredCurrency: PaymentToken,
  preferredCurrencyTotalPrice: number,
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
        ?.map((currency) => currency.address)
        .includes(preferredCurrency.address)
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

        const currencyTotal =
          preferredCurrencyTotalPrice / Number(conversionData?.conversion)

        const usdPrice = conversionData?.usd || 0
        const usdTotal = currencyTotal * usdPrice

        return {
          ...currency,
          usdPrice,
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
        return b.usdPrice - a.usdPrice
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
