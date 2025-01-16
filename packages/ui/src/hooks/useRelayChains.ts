import useSWR from 'swr'
import { axios } from '@reservoir0x/reservoir-sdk'
import { useReservoirClient } from './'

type RelayChain = {
  id: number
  name: string
  displayName: string
  httpRpcUrl: string
  wsRpcUrl: string
  explorerUrl: string
  explorerName: string
  depositEnabled: boolean
  disabled: boolean
  partialDisableLimit: number
  blockProductionLagging: boolean
  currency: {
    id: string
    symbol: string
    name: string
    address: string
    decimals: number
    supportsBridging: boolean
  }
  withdrawalFee: number
  depositFee: number
  surgeEnabled: boolean
  erc20Currencies: Array<{
    id: string
    symbol: string
    name: string
    address: string
    decimals: number
    supportsBridging: boolean
    supportsPermit: boolean
    withdrawalFee: number
    depositFee: number
    surgeEnabled: boolean
  }>
  iconUrl?: string | null
  logoUrl?: string | null
  brandColor?: string | null
  contracts: {
    multicall3: string
    multicaller: string
    onlyOwnerMulticaller: string
    relayReceiver: string
    erc20Router: string
    approvalProxy: string
  }
  vmType: string
  explorerQueryParams?: Record<string, any> | null
}

type RelayChainsResponse = {
  chains: RelayChain[]
}

export default function (chainId?: number) {
  const client = useReservoirClient()

  const chain =
    chainId !== undefined
      ? client?.chains.find((chain) => chain.id === chainId)
      : client?.currentChain()

  const { data: mainnetData, error: mainnetError } =
    useSWR<RelayChainsResponse>(
      chain ? 'https://api.relay.link/chains' : null,
      async (url) => {
        try {
          const response = await axios.get(url)
          return response.data
        } catch (error) {
          console.error('Error fetching relay mainnet chains:', error)
          return undefined
        }
      },
      {
        revalidateOnFocus: false,
      }
    )

  const { data: testnetData, error: testnetError } =
    useSWR<RelayChainsResponse>(
      chain ? 'https://api.testnets.relay.link/chains' : null,
      async (url) => {
        try {
          const response = await axios.get(url)
          return response.data
        } catch (error) {
          console.error('Error fetching relay testnet chains:', error)
          return undefined
        }
      },
      {
        revalidateOnFocus: false,
      }
    )

  let relayLink = null

  const mainnetChain = mainnetData?.chains?.find(
    (chain) => chain.id === chainId
  )
  const testnetChain = !mainnetChain
    ? testnetData?.chains?.find((chain) => chain.id === chainId)
    : null

  if (mainnetChain) {
    relayLink = `https://relay.link/bridge/${mainnetChain.name}`
  } else if (testnetChain) {
    relayLink = `https://testnets.relay.link/bridge/${testnetChain.name}`
  }

  return {
    relayLink,
    isError: !!mainnetError || !!testnetError,
    isLoading:
      (!mainnetData && !mainnetError) || (!testnetData && !testnetError),
  }
}
