import { Execute, paths } from '../types'
import { Signer } from 'ethers'
import { executeSteps, setParams } from '../utils'

type Data = {
  query: paths['/execute/list/v2']['get']['parameters']['query']
  signer: Signer | undefined
  apiBase: string | undefined
  setState: (steps: Execute['steps']) => any
  handleError?: (err: any) => any
  handleSuccess?: () => any
}

/**
 * List a token for sale
 * @param data.query Query object to pass to `/execute/list/v2`
 * @param data.signer Ethereum signer object provided by the browser
 * @param data.apiBase The Reservoir API base URL
 * @param data.setState Callback to update UI state has execution progresses
 * @param data.handleError Callback to handle any errors during the execution
 * @param data.handleSuccess Callback to handle a successful execution
 */
export async function listToken(data: Data) {
  const { query, signer, apiBase, setState, handleSuccess, handleError } = data

  if (
    !query.maker ||
    !query.expirationTime ||
    !query.weiPrice ||
    !query.token ||
    !signer ||
    !apiBase
  ) {
    console.debug(data)
    throw new ReferenceError('Some data is missing')
  }

  try {
    // Construct an URL object for the `/execute/list/v2` endpoint
    const url = new URL('/execute/list/v2', apiBase)

    setParams(url, query)

    await executeSteps(url, signer, setState)

    if (handleSuccess) handleSuccess()
  } catch (err: any) {
    if (handleError) handleError(err)
    console.error(err)
  }
}
