import { Signer } from 'ethers'
import { LogLevel, getClient } from '..'

type TransactionResponse = Awaited<ReturnType<Signer['sendTransaction']>>

/**
 * Safe txhash.wait which handles replacements when users speed up the transactio
 * @param url an URL object
 * @returns A Promise to wait on
 */
export async function sendTransactionSafely(
  data: any,
  signer: Signer,
  setTx: (tx: TransactionResponse) => void,
  tx?: TransactionResponse
) {
  try {
    let transaction = tx
    if (!tx) {
      transaction = await signer.sendTransaction(data)
      setTx(transaction)
    }
    await transaction?.wait()
    return true
  } catch (e) {
    const error = e as any
    if (
      error &&
      error['code'] &&
      error['code'] === 'TRANSACTION_REPLACED' &&
      error.replacement
    ) {
      setTx(error.replacement)
      sendTransactionSafely(data, signer, setTx, error.replacement)
      getClient()?.log(['Transaction replaced', error], LogLevel.Verbose)
    } else {
      throw e
    }
  }
}
