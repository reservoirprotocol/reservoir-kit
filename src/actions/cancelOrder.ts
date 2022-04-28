import { Execute, paths } from '../types'
import { Signer } from 'ethers'
import { executeSteps, setParams } from '../utils'

type Data = {
  query: paths['/execute/cancel/v1']['get']['parameters']['query']
  signer: Signer | undefined
  apiBase: string | undefined
  setState: (steps: Execute['steps']) => any
  handleError?: (err: any) => any
  handleSuccess?: () => any
}

/**
 * Cancel an offer or listing
 * @param data.query Query object to pass to `/execute/cancel/v1`
 * @param data.signer Ethereum signer object provided by the browser
 * @param data.apiBase The Reservoir API base URL
 * @param data.setState Callback to update UI state has execution progresses
 * @param data.handleError Callback to handle any errors during the execution
 * @param data.handleSuccess Callback to handle a successful execution
 */
export async function cancelOrder(data: Data) {
  const { query, signer, apiBase, setState, handleSuccess, handleError } = data

  if (!signer || !apiBase) {
    console.debug(data)
    throw new ReferenceError('Some data is missing')
  }

  try {
    // Construct an URL object for the `/execute/cancel/v1` endpoint
    const url = new URL('/execute/cancel/v1', apiBase)

    setParams(url, query)

    await executeSteps(url, signer, setState)

    if (handleSuccess) handleSuccess()
  } catch (err: any) {
    if (handleError) handleError(err)
    console.error(err)
  }
}
