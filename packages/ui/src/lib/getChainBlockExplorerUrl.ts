import * as allChains from 'viem/chains'
import { customChains } from '@reservoir0x/reservoir-sdk'

const getChainBlockExplorerUrl = (chainId: number) => {
  const wagmiChain: allChains.Chain | undefined = Object.values({
    ...allChains,
    ...customChains,
  }).find(({ id }) => id === chainId)

  return wagmiChain?.blockExplorers?.default?.url || 'https://etherscan.io'
}

export default getChainBlockExplorerUrl
