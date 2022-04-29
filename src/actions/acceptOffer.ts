import { Execute, paths } from '../types'
import { Signer } from 'ethers'
import { executeSteps, setParams } from '../utils'

type Data = {
  query: paths['/execute/sell/v2']['get']['parameters']['query']
  expectedPrice?: number
  signer: Signer | undefined
  apiBase: string | undefined
  setState: (steps: Execute['steps']) => any
  handleError?: (err: any) => any
  handleSuccess?: () => any
}

/**
 * Accept an offer to buy your token
 * @param data.query Query object to pass to `/execute/sell/v2`
 * @param data.expectedPrice Token price used to prevent to protect buyer from price moves. Pass the number with unit 'ether'. Example: `1.543` means 1.543 ETH
 * @param data.signer Ethereum signer object provided by the browser
 * @param data.apiBase The Reservoir API base URL
 * @param data.setState Callback to update UI state has execution progresses
 * @param data.handleError Callback to handle any errors during the execution
 * @param data.handleSuccess Callback to handle a successful execution
 */
export async function acceptOffer(data: Data) {
  const {
    query,
    expectedPrice,
    signer,
    apiBase,
    setState,
    handleSuccess,
    handleError,
  } = data

  if (!signer || !apiBase) {
    console.debug(data)
    throw new ReferenceError('Some data is missing')
  }

  try {
    // Construct an URL object for the `/execute/sell` endpoint
    const url = new URL('/execute/sell/v2', apiBase)

    setParams(url, query)

    await executeSteps(url, signer, setState, undefined, expectedPrice)

    if (handleSuccess) handleSuccess()
  } catch (err: any) {
    if (handleError) handleError(err)
    console.error(err)
  }
}
