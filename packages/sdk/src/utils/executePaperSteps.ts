import { getClient } from '../actions'
import { isAxiosError } from './axios'
import { generateCreditCardEvent } from './events'
import { LogLevel } from './logger'
import { pollUntilHasData } from './pollApi'

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

export type PaperTransactionStatus = 'TRANSFER_SUCCEEDED' | 'PAYMENT_SUCCEEDED'

export async function executePaperSteps(
  transactionId: string,
  clientId: string,
  callback: (
    result: PaperTransactionResult | null,
    status: PaperTransactionStatus
  ) => void
) {
  const client = getClient()
  let reservoirChain = client?.currentChain()

  try {
    await pollUntilHasData(
      {
        url: `https://withpaper.com/api/v1/transaction-status/${transactionId}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${clientId}`,
          accept: 'application/json',
        },
      },
      (data: PaperTransactionResult): boolean => {
        callback(data, data.result.status)

        if (data.result.status === 'TRANSFER_SUCCEEDED') {
          client.log(['Execute Steps: all steps complete'], LogLevel.Verbose)
          client._sendEvent(
            generateCreditCardEvent(data, data.result.status),
            reservoirChain?.id || 1
          )
          return true
        } else return false
      },
      20, // Max Attempts
      0, // Attempt Count
      10000 // Ms Delay
    )
  } catch (e: unknown) {
    if (isAxiosError(e)) {
      client.log(
        ['Execute Paper Steps: Unexpected Paper API response', e.status],
        LogLevel.Error
      )
      client._sendEvent(
        generateCreditCardEvent(e.response?.data || {}, 'ERROR'),
        reservoirChain?.id || 1
      )
    } else {
      client.log(['Execute Paper Steps: Unknown Error', e], LogLevel.Error)
    }

    return false
  }
}
