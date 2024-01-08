import { axios, isAxiosError } from './axios'
import { getClient } from '../actions'
import { LogLevel } from './logger'
import { useTokens } from '@reservoir0x/reservoir-kit-ui'

export interface PaperTransactionResult {
  result: {
    transactionId: string
    checkoutId: string
    contractId: string
    status: PaperTransactionStatus
    transactionHash: string
    hasPaymentError: boolean
    isPaymentSubmitted: boolean
    isPaymentReceived: boolean
    isNFTDelivered: boolean
    claimedTokens: {
      tokens: {
        tokenId: string
        quantity: number
        transferHash: string
        transferExplorerUrl: string
      }[]
      collectionTitle: string
      collectionAddress: string
    }

    isFreeClaim: boolean
    transferSucceededAt: string
  }
}

export interface PaperToken {}

type PaperTransactionStatus = 'TRANSFER_SUCCEEDED'

/**
 *
 * @param transactionId
 */
export async function executePaperSteps(
  transactionId: string,
  clientId: string,
  callback: (
    result: PaperTransactionResult | null,
    status: PaperTransactionStatus | null
  ) => void
) {
  const client = getClient()

  const maximumAttempts = 2.5 * 60 * 1000 // default to
  maximumAttempts
  /**
   * Polling their transaction API similiar to ExecuteSteps
   */
  do {
    try {
      const req = await axios({
        url: `https://withpaper.com/api/v1/transaction-status/${transactionId}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${clientId}`,
          accept: 'application/json',
        },
        /**
         * Throw an error for any status besides 200
         */
        validateStatus: (req) => req !== 200,
      })

      const data = req.data as PaperTransactionResult

      /**
       * Callback to the handler to process the results
       */
      callback(data, data.result.status)

      /**
       * If the transaction has been proccessed we can break out of this loop
       */
      if (data.result.status === 'TRANSFER_SUCCEEDED') {
        break
      }

      /**
       * Minium time to wait is 10+ seconds according to docs
       * @link https://docs.withpaper.com/reference/get-transaction-status
       */
      await new Promise((r) => setTimeout(r, 100000))
    } catch (e: unknown) {
      if (isAxiosError(e)) {
        client.log(
          ['Execute Paper Steps: Unexpected Paper API response', e.status],
          LogLevel.Error
        )
      } else {
        client.log(['Execute Paper Steps: Unknwon Error', e], LogLevel.Error)
      }
    }
  } while (true)
}

export async function handlePaperSteps(
  result: PaperTransactionResult | null,
  status: PaperTransactionStatus | null,
  setTokens: (tokens: PaperToken[]) => void,
  setBuyStep: (step: number) => void
) {
  console.log(result)
  console.log(status)
  if (status === 'TRANSFER_SUCCEEDED') {
    setBuyStep(3)

    setTokens([])
  }
}
