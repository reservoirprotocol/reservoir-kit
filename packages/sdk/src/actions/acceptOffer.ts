import { Signer } from 'ethers'
import { getClient } from '.'
import { Execute, paths } from '../types'
import { executeSteps, request } from '../utils'

export type Token = Pick<
  NonNullable<
    NonNullable<
      paths['/tokens/v5']['get']['responses']['200']['schema']['tokens']
    >[0]['token']
  >,
  'tokenId' | 'contract'
>

type AcceptOfferBodyParameters =
  paths['/execute/sell/v6']['post']['parameters']['body']['body']

export type AcceptOfferOptions = Partial<
  Omit<AcceptOfferBodyParameters, 'token'>
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
 * @param data.onProgress Callback to update UI state as execution progresses
 */
export async function acceptOffer(data: Data) {
  const { token, expectedPrice, signer, onProgress } = data
  const taker = await signer.getAddress()
  const client = getClient()
  const options = data.options || {}
  const baseApiUrl = client.currentChain()?.baseApiUrl

  if (!client.currentChain()) {
    throw new ReferenceError('ReservoirClient missing chain configuration')
  }

  try {
    const params: AcceptOfferBodyParameters = {
      taker: taker,
      token: `${token.contract}:${token.tokenId}`,
      source: client.source || undefined,
      ...options,
    }

    if (
      client.normalizeRoyalties !== undefined &&
      params.normalizeRoyalties === undefined
    ) {
      params.normalizeRoyalties = client.normalizeRoyalties
    }

    await executeSteps(
      {
        url: `${baseApiUrl}/execute/sell/v6`,
        method: 'post',
        data: params,
      },
      signer,
      onProgress,
      undefined,
      expectedPrice
    )
    return true
  } catch (err: any) {
    const data: paths['/tokens/refresh/v1']['post']['parameters']['body']['body'] =
      {
        token: `${token.contract}:${token.tokenId}`,
      }
    request({
      method: 'POST',
      url: `${baseApiUrl}/tokens/refresh/v1`,
      data: JSON.stringify(data),
    })
    throw err
  }
}
