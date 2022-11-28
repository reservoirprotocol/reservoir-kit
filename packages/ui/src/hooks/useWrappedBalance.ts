import wrappedContracts from '../constants/wrappedContracts'
import { useBalance, useNetwork } from 'wagmi'
import { UseBalanceToken } from '../types/wagmi'

export default function (params: Parameters<typeof useBalance>['0']) {
  const { chain: activeChain, chains } = useNetwork()
  let chain = chains.find((chain) => activeChain?.id === chain.id)

  if (!chain && chains.length > 0) {
    chain = chains[0]
  } else {
    chain = activeChain
  }

  const contractAddress =
    chain?.id !== undefined && chain.id in wrappedContracts
      ? wrappedContracts[chain.id]
      : wrappedContracts[1]

  const balance = useBalance({
    ...params,
    token: contractAddress as UseBalanceToken,
  })

  return {
    balance,
    contractAddress,
  }
}
