import wrappedContracts from '../constants/wrappedContracts'
import { useBalance, useNetwork } from 'wagmi'

export default function (params: Parameters<typeof useBalance>['0']) {
  const { chain } = useNetwork()
  const contractAddress =
    chain?.id !== undefined && chain.id in wrappedContracts
      ? wrappedContracts[chain.id]
      : wrappedContracts[1]

  const balance = useBalance({
    ...params,
    token: contractAddress,
  })

  return {
    balance,
    contractAddress,
  }
}
