import { Execute, paths } from '../types'
import { Signer } from 'ethers'
import { executeSteps } from '../utils'
import { getClient } from '.'

type CancelOrdersPathParameters =
  paths['/execute/cancel/v3']['post']['parameters']['body']

export type CancelOrdersOptions = Omit<NonNullable<CancelOrdersPathParameters['body']>, 'params'>

type Data = {
  orderIds: string[]
  signer: Signer
  options?: CancelOrdersOptions
  onProgress: (steps: Execute['steps']) => any
}

/**
 * Cancel offers or listings
 * @param data.orderIds Ids of the orders to cancel
 * @param data.signer Ethereum signer object provided by the browser
 * @param data.options Additional options to pass into the cancel request
 * @param data.onProgress Callback to update UI state has execution progresses
 */
export async function cancelOrders(data: Data) {
  const { orderIds, signer, onProgress } = data
  const client = getClient()
  const options = data.options || {}
  const baseApiUrl = client.currentChain()?.baseApiUrl

  if (!baseApiUrl) {
    throw new ReferenceError('ReservoirClient missing chain configuration')
  }

  try {
    await executeSteps(
      {
        method: 'post',
        url: `${baseApiUrl}/execute/cancel/v3`,
        data: {
          params: {
            kind: 'orderIds',
            data: { orderIds }
          },
          ...options
        }
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
