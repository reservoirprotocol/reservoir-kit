import { PublicClient, Transaction } from 'viem'
import { LogLevel, getClient } from '..'
import { Execute, ReservoirWallet, TransactionStepItem } from '../types'
import axios, {
  AxiosRequestConfig,
  AxiosRequestHeaders,
  AxiosResponse,
} from 'axios'

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
  setTx: (tx: Transaction['hash']) => void,
  request: AxiosRequestConfig,
  headers: AxiosRequestHeaders
) {
  let txHash = await wallet.handleSendTransactionStep(chainId, item, step)
  const maximumAttempts = 30
  let attemptCount = 0
  let waitingForConfirmation = true
  let transactionCancelled = false

  if (!txHash) {
    throw Error('Transaction hash not returned from sendTransaction method')
  }
  setTx(txHash)

  // Handle transaction replacements and cancellations
  viemClient
    .waitForTransactionReceipt({
      hash: txHash,
      onReplaced: (replacement) => {
        if (replacement.reason === 'cancelled') {
          transactionCancelled = true
          throw Error('Transaction cancelled')
        }

        setTx(replacement.transaction.hash)
        txHash = replacement.transaction.hash
        attemptCount = 0 // reset attempt count
        getClient()?.log(
          ['Transaction replaced', replacement],
          LogLevel.Verbose
        )
      },
    })
    .catch((error) => {
      getClient()?.log(
        ['Error in waitForTransactionReceipt', error],
        LogLevel.Error
      )
    })

  const validate = (res: AxiosResponse) => {
    getClient()?.log(
      ['Execute Steps: Polling for confirmation', res],
      LogLevel.Verbose
    )
    return res.status === 200 && res.data && res.data.synced
  }

  // Poll the confirmation url to confirm the transaction went through
  while (
    waitingForConfirmation &&
    attemptCount < maximumAttempts &&
    !transactionCancelled
  ) {
    const res = await axios.request({
      url: `${request.baseURL}/transactions/${txHash}/synced/v1`,
      method: 'get',
      headers: headers,
    })

    if (validate(res)) {
      waitingForConfirmation = false // transaction confirmed
    } else {
      attemptCount++
      await new Promise((resolve) => setTimeout(resolve, 5000)) // wait for 5 seconds
    }
  }

  if (attemptCount >= maximumAttempts) {
    throw Error(
      `Failed to get an ok response after ${attemptCount} attempt(s), aborting`
    )
  }

  if (transactionCancelled) {
    throw Error('Transaction was cancelled')
  }

  return true
}
