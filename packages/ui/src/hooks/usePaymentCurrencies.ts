import { erc20ABI, useBalance, useContractReads } from 'wagmi'
import { Address, zeroAddress } from 'viem'
import { useReservoirClient, useCoinConversion } from './'

export default function (
  address: Address,
  listingCurrencyAddress: Address,
  chainId?: number
) {
  const client = useReservoirClient()
  const chain =
    chainId !== undefined
      ? client?.chains.find((chain) => chain.id === chainId)
      : client?.currentChain()

  const nonNativeCurrencies = chain?.paymentCurrencies?.filter(
    (currency) => currency.address !== zeroAddress
  )

  const currencySymbols = chain?.paymentCurrencies
    ?.map((currency) => currency.symbol)
    .join(',')
  const currencyCoingeckoIds = chain?.paymentCurrencies
    ?.map((currency) => currency.coinGeckoId)
    .join(',')

  const { data: nonNativeBalances } = useContractReads({
    contracts: nonNativeCurrencies?.map((currency) => ({
      abi: erc20ABI,
      address: currency.address as `0x${string}`,
      chainId: chainId,
      functionName: 'balanceOf',
      args: [address],
    })),
    watch: true,
    enabled: address ? true : false,
    allowFailure: false,
  })

  const nativeBalance = useBalance({
    address,
    chainId: chainId,
    watch: true,
  })

  const usdConversions = useCoinConversion(
    'USD',
    currencySymbols,
    currencyCoingeckoIds
  )

  console.log(chain?.paymentCurrencies)

  return
}
