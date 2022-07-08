import { Execute, paths } from '../types'
import { Signer } from 'ethers'
import { executeSteps, setParams } from '../utils'
import { ReservoirSDK } from '.'

type ListTokenPathParameters =
  paths['/execute/list/v2']['get']['parameters']['query']

export type ListTokenOptions = Omit<
  paths['/execute/list/v2']['get']['parameters']['query'],
  'token' | 'maker' | 'weiPrice' | 'expirationTime'
>

type Data = {
  token: ListTokenPathParameters['token']
  weiPrice: ListTokenPathParameters['weiPrice']
  expirationTime: ListTokenPathParameters['expirationTime']
  signer: Signer
  options?: ListTokenOptions
  onProgress: (steps: Execute['steps']) => any
}

/**
 * List a token for sale
 * @param data.token Token to list
 * @param data.weiPrice Price in wei to list the token as
 * @param data.expirationTime Unix time to expire the listing
 * @param data.signer Ethereum signer object provided by the browser
 * @param data.options Additional options to pass into the list request
 * @param data.onProgress Callback to update UI state has execution progresses
 */

export async function listToken(data: Data) {
  const { token, weiPrice, expirationTime, signer, onProgress } = data
  const client = ReservoirSDK.client()
  const options = data.options || {}
  const maker = await signer.getAddress()

  if (!client.apiBase) {
    throw new ReferenceError('ReservoirSDK missing configuration')
  }

  try {
    // Construct a URL object for the `/execute/list/v2` endpoint
    const url = new URL('/execute/list/v2', client.apiBase)
    const query: ListTokenPathParameters = {
      fee: client.fee,
      feeRecipient: client.feeRecipient,
      automatedRoyalties: client.automatedRoyalties,
      ...options,
      token,
      weiPrice,
      expirationTime,
      maker,
    }

    setParams(url, query)

    await executeSteps(url, signer, onProgress)
    return true
  } catch (err: any) {
    console.error(err)
    throw err
  }
}
