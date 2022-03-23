import { Execute, paths } from '../types'
import { Signer } from 'ethers'
import { executeSteps, setParams } from '../utils'

type Data = {
  id: string | undefined
  maker: string | undefined
  signer: Signer | undefined
  apiBase: string | undefined
  setState: (steps: Execute['steps']) => any
  handleError?: (err: any) => any
  handleSuccess?: () => any
}

/**
 * Cancel an offer or lisitng
 * @param data
 */
export async function cancelOrder(data: Data) {
  const { id, maker, signer, apiBase, setState, handleSuccess, handleError } =
    data

  if (!id || !maker || !signer || !apiBase) {
    console.debug(data)
    throw new ReferenceError('Some data is missing')
  }

  try {
    // Construct an URL object for the `/execute/cancel/v1` endpoint
    const url = new URL('/execute/cancel/v1', apiBase)

    // Construct the query object to execute the trade
    const query: paths['/execute/cancel/v1']['get']['parameters']['query'] = {
      id,
      maker,
    }

    setParams(url, query)

    await executeSteps(url, signer, setState)

    if (handleSuccess) handleSuccess()
  } catch (err: any) {
    if (handleError) handleError(err)
    console.error(err)
  }
}
