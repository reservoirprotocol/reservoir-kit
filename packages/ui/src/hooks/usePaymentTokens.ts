import { erc20ABI, useBalance, useContractReads } from 'wagmi'
import { Address, formatUnits, zeroAddress } from 'viem'
import { useReservoirClient, useCoinConversion } from '.'
import { useMemo } from 'react'
import { ReservoirChain } from '@reservoir0x/reservoir-sdk'
import { PaymentToken } from '@reservoir0x/reservoir-sdk/src/utils/paymentTokens'

export type EnhancedCurrency =
  | NonNullable<ReservoirChain['paymentTokens']>[0] & {
      usdPrice?: number
      balance?: string | number | bigint
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

  const nonNativeCurrencies = useMemo(() => {
    let currencies = chain?.paymentTokens?.filter(
      (currency) => currency.address !== zeroAddress
    )

    // If prefferedCurrency is not the native currency and not already included in paymentTokens, add to nonNativeCurrencies
    if (
      preferredCurrency?.address !== zeroAddress &&
      !currencies
        ?.map((currency) => currency.address)
        .includes(preferredCurrency.address)
    ) {
      currencies?.push(preferredCurrency)
    }

    return currencies
  }, [chain?.paymentTokens])

  const currencySymbols = chain?.paymentTokens
    ?.map((currency) => currency.symbol)
    .join(',')
  const currencyCoingeckoIds = chain?.paymentTokens
    ?.map((currency) => currency.coinGeckoId)
    .join(',')

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
    watch: open,
    enabled: open,
    allowFailure: false,
  })

  const nativeBalance = useBalance({
    address: open ? address : undefined,
    chainId: chainId,
    watch: open,
  })

  const usdConversions = useCoinConversion(
    open ? 'USD' : undefined,
    currencySymbols,
    currencyCoingeckoIds
  )

  const paymentTokens = useMemo(() => {
    if (!open) {
      return []
    }
    const currencyToUsdConversions = usdConversions.reduce((map, data) => {
      map[data.symbol] = data
      map[data.id] = data
      return map
    }, {} as Record<string, typeof usdConversions[0]>)

    return chain?.paymentTokens
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

        const conversion =
          currencyToUsdConversions[
            currency?.coinGeckoId && currency?.coinGeckoId.length > 0
              ? currency?.coinGeckoId
              : currency?.symbol?.toLowerCase()
          ]
        const usdPrice =
          Number(formatUnits(BigInt(balance), currency?.decimals || 18)) *
          (conversion?.price || 0)
        return {
          ...currency,
          usdPrice,
          balance,
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
    usdConversions,
    nonNativeBalances,
    nativeBalance,
  ])

  return paymentTokens
}
