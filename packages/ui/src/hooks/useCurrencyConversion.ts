import { paths } from '@reservoir0x/reservoir-sdk'
import useReservoirClient from './useReservoirClient'
import useSWR from 'swr/immutable'

export default function (chainId?: number, from?: string, to?: string) {
  const client = useReservoirClient()
  const chain =
    chainId !== undefined
      ? client?.chains.find((chain) => chain.id === chainId)
      : client?.currentChain()
  const path = new URL(
    `${chain?.baseApiUrl}/currencies/conversion/v1?from=${from}&to=${to}`
  )

  return useSWR<
    paths['/currencies/conversion/v1']['get']['responses'][200]['schema']
  >(from && to ? [path.href, client?.apiKey, client?.version] : null, null, {
    refreshInterval: 300000, //5m
  })
}
