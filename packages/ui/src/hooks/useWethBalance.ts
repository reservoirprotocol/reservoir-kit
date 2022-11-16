import { useBalance, useNetwork } from 'wagmi'
import { UseBalanceToken } from '@reservoir0x/reservoir-kit-client'

const wethContracts: Record<number, string> = {
  1: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  4: '0xc778417E063141139Fce010982780140Aa0cD5Ab',
  5: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
}

export default function (params: Parameters<typeof useBalance>['0']) {
  const { chain } = useNetwork()

  let contractAddress =
    chain?.id !== undefined && chain.id in wethContracts
      ? wethContracts[chain.id]
      : wethContracts[1]

  const balance = useBalance({
    ...params,
    token: contractAddress as UseBalanceToken
  })

  return {
    balance,
    contractAddress,
  }
}
