import { getClient, customChains } from '@reservoir0x/reservoir-sdk'
import { Address, zeroAddress } from 'viem'
import * as allChains from 'viem/chains'

export default (chainId?: number) => {
  const client = getClient()
  const reservoirChain = chainId
    ? client.chains.find((chain) => chain.id === chainId)
    : client.currentChain()

  const chains = Object.values({ ...allChains, ...customChains })
  let chain = chains.find((chain) => reservoirChain?.id === chain.id)

  if (!chain && chains.length > 0) {
    chain = chains[0]
  }

  const ETHChains: number[] = [allChains.mainnet.id, allChains.goerli.id]

  if (!chain || !chain.nativeCurrency || ETHChains.includes(chain.id)) {
    return {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
      address: zeroAddress as Address,
      chainId: chain?.id || allChains.mainnet.id,
    }
  } else {
    return {
      ...chain.nativeCurrency,
      address: zeroAddress as Address,
      chainId: chain.id,
    }
  }
}
