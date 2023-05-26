import { Transaction, WalletClient, createPublicClient, http } from 'viem'
import { LogLevel, getClient } from '..'
import * as allChains from 'viem/chains'

/**
 * Safe txhash.wait which handles replacements when users speed up the transaction
 * @param url an URL object
 * @returns A Promise to wait on
 */
export async function sendTransactionSafely(
  chainId: number,
  data: any,
  signer: WalletClient,
  setTx: (tx: Transaction['hash']) => void
) {
  const viemChain = Object.values(allChains).find(
    (chain) => chain.id === chainId
  )

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
    hash: transaction,
    onReplaced: (replacement) => {
      setTx(replacement.transaction.hash)
      getClient()?.log(['Transaction replaced', replacement], LogLevel.Verbose)
    },
  })

  return true
}
