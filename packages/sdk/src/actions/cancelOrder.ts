import { Execute, paths } from '../types'
import { Signer } from 'ethers'
import { executeSteps } from '../utils'
import { getClient } from '.'

type CancelOrderPathParameters =
  paths['/execute/cancel/v2']['get']['parameters']['query']

export type CancelOrderOptions = Omit<CancelOrderPathParameters, 'maker' | 'id'>

type Data = {
  id: CancelOrderPathParameters['id']
  signer: Signer
  options?: CancelOrderOptions
  onProgress: (steps: Execute['steps']) => any
}

/**
 * Cancel an offer or listing
 * @param data.id Id of the order to cancel
 * @param data.signer Ethereum signer object provided by the browser
 * @param data.options Additional options to pass into the cancel request
 * @param data.onProgress Callback to update UI state has execution progresses
 */
export async function cancelOrder(data: Data) {
  const { id, signer, onProgress } = data
  const client = getClient()
  const options = data.options || {}

  if (!client.apiBase) {
    throw new ReferenceError('ReservoirClient missing configuration')
  }

  try {
    const params: CancelOrderPathParameters = { id, ...options }

    await executeSteps(
      {
        url: `${client.apiBase}/execute/cancel/v2`,
        params: params,
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
