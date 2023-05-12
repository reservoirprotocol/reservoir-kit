import { Transaction, WalletClient, createPublicClient, http } from 'viem'
import { LogLevel, getClient } from '..'

/**
 * Safe txhash.wait which handles replacements when users speed up the transactio
 * @param url an URL object
 * @returns A Promise to wait on
 */
export async function sendTransactionSafely(
  data: any,
  signer: WalletClient,
  setTx: (tx: Transaction['hash']) => void
  // tx?: TransactionResponse
) {
  const viemClient = createPublicClient({
    chain: undefined,
    transport: http(),
  })

  const transaction = await signer.sendTransaction({
    chain: undefined,
    account: data.from,
    to: data.to,
    value: data.value,
  })
  setTx(transaction)

  await viemClient.waitForTransactionReceipt({
    hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d',
    onReplaced: (replacement) => {
      const x = replacement.replacedTransaction
      setTx(replacement.replacedTransaction.hash)
      // sendTransactionSafely(data, signer, setTx, replacement.replacedTransaction.hash) //TODO: test speeding up a transaction
      getClient()?.log(['Transaction replaced', replacement], LogLevel.Verbose)
    },
  })

  return true
}
