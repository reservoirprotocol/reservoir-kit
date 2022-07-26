import { Signer } from 'ethers'
import { getClient } from '.'
import { BatchExecute, paths } from '../types'
import { batchExecuteSteps } from '../utils'

export type Token = Pick<
  NonNullable<
    paths['/tokens/v4']['get']['responses']['200']['schema']['tokens']
  >[0],
  'tokenId' | 'contract'
>

type AcceptOfferPathParameters =
  paths['/execute/sell/v3']['get']['parameters']['query']

export type AcceptOfferOptions = Omit<
  AcceptOfferPathParameters,
  'token' | 'taker'
>

type Data = {
  token: Token
  options?: AcceptOfferOptions
  expectedPrice?: number
  signer: Signer
  onProgress: (steps: BatchExecute['steps']) => any
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
  const client = getClient()
  const options = data.options || {}

  if (!client.apiBase) {
    throw new ReferenceError('ReservoirClient missing configuration')
  }

  try {
    const params: AcceptOfferPathParameters = {
      taker: taker,
      token: `${token.contract}:${token.tokenId}`,
      source: client.source,
      ...options,
    }

    await batchExecuteSteps(
      {
        url: `${client.apiBase}/execute/sell/v3`,
        params,
      },
      signer,
      onProgress,
      undefined,
      expectedPrice
    )
    return true
  } catch (err: any) {
    console.error(err)
    throw err
  }
}
