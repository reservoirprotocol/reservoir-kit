import { Execute, paths } from '../types'
import { Signer } from 'ethers'
import { getClient } from '.'
import { executeSteps, request } from '../utils'

type MintBodyParameters = NonNullable<
  paths['/execute/mint/v1']['post']['parameters']['body']['body']
>

export type MintOptions = Partial<
  Omit<MintBodyParameters, 'collection' | 'source' | 'quantity' | 'taker'>
>

type Data = {
  collection: string
  quantity?: number
  options?: MintOptions
  signer: Signer
  onProgress: (steps: Execute['steps'], path: Execute['path']) => any
}

/**
 * Instantly buy a token
 * @param data.collection Collection that the user wishes to mint from
 * @param data.quantity Quantity of tokens that the user wishes to mint
 * @param data.options Additional options to pass into the buy request
 * @param data.signer Ethereum signer object provided by the browser
 * @param data.onProgress Callback to update UI state as execution progresses
 */
export async function mint(data: Data) {
  const { collection, quantity = 1, signer, onProgress } = data
  const taker = await signer.getAddress()
  const client = getClient()
  const options = data.options || {}
  const baseApiUrl = client.currentChain()?.baseApiUrl

  if (!baseApiUrl) {
    throw new ReferenceError('ReservoirClient missing chain configuration')
  }

  try {
    const params: MintBodyParameters = {
      collection,
      quantity,
      taker,
      source: client.source || undefined,
      ...options,
    }

    return executeSteps(
      {
        url: `${baseApiUrl}/execute/mint/v1`,
        method: 'post',
        data: params,
      },
      signer,
      onProgress,
      undefined
    )
  } catch (err) {
    throw err
  }
}
