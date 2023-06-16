import { PublicClient, Transaction } from 'viem'
import { LogLevel, getClient } from '..'
import { ReservoirWallet } from '../types'

/**
 * Safe txhash.wait which handles replacements when users speed up the transaction
 * @param url an URL object
 * @returns A Promise to wait on
 */
export async function sendTransactionSafely(
  chainId: number,
  viemClient: PublicClient,
  data: any,
  wallet: ReservoirWallet,
  setTx: (tx: Transaction['hash']) => void
) {
  const txHash = await wallet.sendTransaction(chainId, data)
  if (!txHash) {
    throw 'Transaction hash not returned from sendTransaction method'
  }
  setTx(txHash)

  await viemClient.waitForTransactionReceipt({
    hash: txHash,
    onReplaced: (replacement) => {
      setTx(replacement.transaction.hash)
      getClient()?.log(['Transaction replaced', replacement], LogLevel.Verbose)
    },
  })

  return true
}
