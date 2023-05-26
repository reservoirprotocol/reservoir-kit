import { Execute, paths } from '../types'
import { WalletClient } from 'viem'
import { executeSteps } from '../utils'
import { getClient } from '.'

type CancelOrderBodyParameters =
  paths['/execute/cancel/v3']['post']['parameters']['body']

export type CancelOrderOptions = Omit<
  NonNullable<CancelOrderBodyParameters['body']>,
  'orderIds'
>

type Data = {
  ids: string[]
  signer: WalletClient
  options?: CancelOrderOptions
  onProgress: (steps: Execute['steps']) => any
}

/**
 * Cancel offers or listings
 * @param data.ids Ids of the orders to cancel
 * @param data.signer Ethereum signer object provided by the browser
 * @param data.options Additional options to pass into the cancel request
 * @param data.onProgress Callback to update UI state has execution progresses
 */
export async function cancelOrder(data: Data) {
  const { ids, signer, onProgress } = data
  const client = getClient()
  const options = data.options || {}
  const baseApiUrl = client.currentChain()?.baseApiUrl

  if (!baseApiUrl) {
    throw new ReferenceError('ReservoirClient missing chain configuration')
  }

  if (ids.length === 0) {
    throw {
      message: 'No order ids specified',
    }
  }

  try {
    await executeSteps(
      {
        method: 'post',
        url: `${baseApiUrl}/execute/cancel/v3`,
        data: {
          orderIds: ids,
          ...options,
        } as NonNullable<CancelOrderBodyParameters['body']>,
      },
      signer,
      onProgress
    )
    return true
  } catch (err: any) {
    console.error(err)
    throw err
  }
}
