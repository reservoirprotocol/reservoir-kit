import { Signer } from 'ethers'
import { ReservoirSDK } from '../client'
import { Execute, paths } from '../types'
import { executeSteps, setParams } from '../utils'

export type Token = Pick<
  NonNullable<
    paths['/tokens/v4']['get']['responses']['200']['schema']['tokens']
  >[0],
  'tokenId' | 'contract'
>

type AcceptOfferPathParameters =
  paths['/execute/sell/v2']['get']['parameters']['query']

export type AcceptOfferOptions = Omit<
  AcceptOfferPathParameters,
  'token' | 'taker'
>

type Data = {
  token: Token
  options?: AcceptOfferOptions
  expectedPrice?: number
  signer: Signer
  onProgress: (steps: Execute['steps']) => any
}

/**
 * Accept an offer to buy your token
 * @param data.token Token being accepted
 * @param data.expectedPrice Token price used to prevent to protect buyer from price moves. Pass the number with unit 'ether'. Example: `1.543` means 1.543 ETH
 * @param data.signer Ethereum signer object provided by the browser
 * @param data.options Additional options to pass into the accept request
 * @param data.onProgress Callback to update UI state has execution progresses
 */
export async function acceptOffer(data: Data) {
  const { token, expectedPrice, signer, onProgress } = data
  const taker = await signer.getAddress()
  const client = ReservoirSDK.client()
  const options = data.options || {}

  if (!client.apiBase) {
    throw new ReferenceError('ReservoirSDK missing configuration')
  }

  try {
    // Construct a URL object for the `/execute/sell` endpoint
    const url = new URL('/execute/sell/v2', client.apiBase)

    const query: AcceptOfferPathParameters = {
      taker: taker,
      token: `${token.contract}:${token.tokenId}`,
      ...options,
    }
    setParams(url, query)

    await executeSteps(url, signer, onProgress, undefined, expectedPrice)
    return true
  } catch (err: any) {
    console.error(err)
    throw err
  }
}
