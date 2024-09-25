import * as allChains from 'viem/chains'
import { customChains } from '@reservoir0x/reservoir-sdk'

const getChainBlockExplorerUrl = (chainId: number) => {
  const wagmiChain: allChains.Chain | undefined = Object.values({
    ...allChains,
    ...customChains,
  }).find(({ id }) => id === chainId)

  if (chainId === 999) {
    return allChains.zoraTestnet.blockExplorers.default.url
  }

  if (chainId === 747) {
    return customChains.flow.blockExplorers.default.url
  }

  return wagmiChain?.blockExplorers?.default?.url || 'https://etherscan.io'
}

export default getChainBlockExplorerUrl
