import { Execute, paths } from '../types'
import { Signer } from 'ethers'
import { executeSteps, setParams } from '../utils'
import { ReservoirSDK } from '../client'

type CancelOrderPathParameters =
  paths['/execute/cancel/v1']['get']['parameters']['query']

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
  const client = ReservoirSDK.client()
  const maker = await signer.getAddress()
  const options = data.options || {}

  if (!client.apiBase) {
    throw new ReferenceError('ReservoirSDK missing configuration')
  }

  try {
    // Construct a URL object for the `/execute/cancel/v1` endpoint
    const url = new URL('/execute/cancel/v1', client.apiBase)
    const query: CancelOrderPathParameters = { id, maker, ...options }
    setParams(url, query)

    await executeSteps(url, signer, onProgress)
    return true
  } catch (err: any) {
    console.error(err)
    throw err
  }
}
