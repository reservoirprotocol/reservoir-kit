import { PublicClient, Transaction } from 'viem'
import { LogLevel, getClient } from '..'
import { Execute, ReservoirWallet, TransactionStepItem } from '../types'

/**
 * Safe txhash.wait which handles replacements when users speed up the transaction
 * @param url an URL object
 * @returns A Promise to wait on
 */
export async function sendTransactionSafely(
  chainId: number,
  viemClient: PublicClient,
  item: TransactionStepItem,
  step: Execute['steps'][0],
  wallet: ReservoirWallet,
  setTx: (tx: Transaction['hash']) => void
) {
  const txHash = await wallet.handleSendTransactionStep(chainId, item, step)
  if (!txHash) {
    throw Error('Transaction hash not returned from sendTransaction method')
  }
  setTx(txHash)

  await viemClient.waitForTransactionReceipt({
    hash: txHash,
    onReplaced: (replacement) => {
      if (replacement.reason === 'cancelled') {
        throw Error('Transaction cancelled')
      }
      setTx(replacement.transaction.hash)
      getClient()?.log(['Transaction replaced', replacement], LogLevel.Verbose)
    },
  })

  return true
}
