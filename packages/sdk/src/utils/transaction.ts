import { PublicClient, Transaction, WalletClient } from 'viem'
import { LogLevel, getClient } from '..'
import { Chain } from 'viem'

/**
 * Safe txhash.wait which handles replacements when users speed up the transaction
 * @param url an URL object
 * @returns A Promise to wait on
 */
export async function sendTransactionSafely(
  viemChain: Chain,
  viemClient: PublicClient,
  data: any,
  signer: WalletClient,
  setTx: (tx: Transaction['hash']) => void
) {
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
