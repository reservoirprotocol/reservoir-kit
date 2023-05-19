import { Transaction, WalletClient, createPublicClient, http } from 'viem'
import { LogLevel, getClient } from '..'
import { mainnet, goerli, polygon, arbitrum, optimism } from 'viem/chains'

/**
 * Safe txhash.wait which handles replacements when users speed up the transactio
 * @param url an URL object
 * @returns A Promise to wait on
 */
export async function sendTransactionSafely(
  chainId: number,
  data: any,
  signer: WalletClient,
  setTx: (tx: Transaction['hash']) => void
  // tx?: TransactionResponse
) {
  const supportedChains = [mainnet, goerli, polygon, arbitrum, optimism]
  const viemChain = supportedChains.find((chain) => chain.id === chainId)

  const viemClient = createPublicClient({
    chain: viemChain,
    transport: http(),
  })

  const transaction = await signer.sendTransaction({
    chain: viemChain,
    data: data.data,
    account: data.from,
    to: data.to,
    value: data.value,
  })

  setTx(transaction)

  await viemClient.waitForTransactionReceipt({
    hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d',
    onReplaced: (replacement) => {
      setTx(replacement.replacedTransaction.hash)
      // sendTransactionSafely(data, signer, setTx, replacement.replacedTransaction.hash) //TODO: test speeding up a transaction
      getClient()?.log(['Transaction replaced', replacement], LogLevel.Verbose)
    },
  })

  return true
}
