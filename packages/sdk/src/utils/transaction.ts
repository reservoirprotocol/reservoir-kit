import { Address, PublicClient } from 'viem'
import { LogLevel, getClient } from '..'
import { Execute, ReservoirWallet, TransactionStepItem } from '../types'
import { CrossChainTransactionError, TransactionTimeoutError } from '../errors'
import axios, {
  AxiosRequestConfig,
  AxiosRequestHeaders,
  AxiosResponse,
} from 'axios'
import { customChains } from './customChains'
import * as allChains from 'viem/chains'

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
  setTxHashes: (
    tx: NonNullable<Execute['steps'][0]['items']>[0]['txHashes']
  ) => void,
  setInternalTxHashes: (
    tx: NonNullable<Execute['steps'][0]['items']>[0]['internalTxHashes']
  ) => void,
  request: AxiosRequestConfig,
  headers: AxiosRequestHeaders,
  isCrossChainIntent?: boolean,
  crossChainIntentChainId?: number
) {
  const client = getClient()
  const reservoirChain =
    client.chains.find((chain) => chain.id == chainId) || null
  let txHash = await wallet.handleSendTransactionStep(chainId, item, step)
  const pollingInterval = reservoirChain?.checkPollingInterval ?? 5000
  const maximumAttempts =
    client.maxPollingAttemptsBeforeTimeout ??
    (2.5 * 60 * 1000) / pollingInterval // default to 2 minutes and 30 seconds worth of attempts
  let attemptCount = 0
  let waitingForConfirmation = true
  let transactionCancelled = false

  if (!txHash) {
    throw Error('Transaction hash not returned from sendTransaction method')
  }
  setTxHashes([{ txHash: txHash, chainId: chainId }])

  // Handle transaction replacements and cancellations
  const receipt = await viemClient
    .waitForTransactionReceipt({
      hash: txHash,
      onReplaced: (replacement) => {
        if (replacement.reason === 'cancelled') {
          transactionCancelled = true
          throw Error('Transaction cancelled')
        }

        setTxHashes([
          { txHash: replacement.transaction.hash, chainId: chainId },
        ])
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
  if (!receipt || receipt.status === 'reverted') {
    getClient()?.log(
      ['Transaction reverted or missing tx receipt', receipt],
      LogLevel.Verbose
    )
    throw Error('Transaction reverted or missing tx receipt')
  }

  const validate = (res: AxiosResponse) => {
    getClient()?.log(
      ['Execute Steps: Polling for confirmation', res],
      LogLevel.Verbose
    )
    if (res.status !== 200 || !res.data) {
      return false
    }

    if (res.data.status === 'failure') {
      throw Error('Transaction failed')
    }

    if (res.data.status === 'success') {
      if (txHash) {
        setInternalTxHashes([{ txHash: txHash, chainId: chainId }])
      }

      if (res.data.txHashes) {
        const chainTxHashes = res.data.txHashes.map((hash: Address) => {
          return { txHash: hash, chainId: crossChainIntentChainId || chainId }
        })
        setTxHashes(chainTxHashes)
      }
      return true
    }

    return res.data.synced || false
  }

  // Poll the confirmation url to confirm the transaction went through
  while (
    waitingForConfirmation &&
    attemptCount < maximumAttempts &&
    !transactionCancelled
  ) {
    let res

    if (item?.check?.endpoint) {
      res = await axios.request({
        url: `${request.baseURL}${item?.check?.endpoint}`,
        method: item?.check?.method ?? 'POST',
        headers: headers,
        data: {
          // @ts-ignore
          kind: item?.check?.body?.kind,
          // @ts-ignore
          chainId: item?.check?.body?.chainId,
          // @ts-ignore
          id: item?.check?.body?.id ?? txHash,
        },
      })
    } else {
      res = await axios.request({
        url: `${request.baseURL}/transactions/${txHash}/synced/v1`,
        method: 'get',
        headers: headers,
      })
    }

    if (validate(res)) {
      waitingForConfirmation = false // transaction confirmed
    } else {
      if (
        !isCrossChainIntent ||
        (isCrossChainIntent && res.data.status !== 'pending')
      ) {
        attemptCount++
      }

      await new Promise((resolve) => setTimeout(resolve, pollingInterval))
    }
  }

  if (attemptCount >= maximumAttempts) {
    if (isCrossChainIntent) {
      throw new CrossChainTransactionError()
    } else {
      const wagmiChain: allChains.Chain | undefined = Object.values({
        ...allChains,
        ...customChains,
      }).find(({ id }) => id === chainId)

      throw new TransactionTimeoutError(
        txHash,
        attemptCount,
        wagmiChain?.blockExplorers?.default.url
      )
    }
  }

  if (transactionCancelled) {
    throw Error('Transaction was cancelled')
  }

  return true
}
