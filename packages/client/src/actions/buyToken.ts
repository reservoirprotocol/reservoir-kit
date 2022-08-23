import { Execute, paths } from '../types'
import { Signer } from 'ethers'
import { getClient } from '.'
import { executeSteps } from '../utils/executeSteps'

export type Token = Pick<
  NonNullable<
    paths['/tokens/v4']['get']['responses']['200']['schema']['tokens']
  >[0],
  'tokenId' | 'contract'
>

type BuyTokenPathParameters =
  paths['/execute/buy/v3']['get']['parameters']['query']

export type BuyTokenOptions = Omit<BuyTokenPathParameters, 'taker' | 'source'>

type Data = {
  tokens: Token[]
  expectedPrice?: number
  options?: BuyTokenOptions
  signer: Signer
  onProgress: (steps: Execute['steps']) => any
}

/**
 * Instantly buy a token
 * @param data.tokens Tokens to be purchased
 * @param data.expectedPrice Token price used to prevent to protect buyer from price moves. Pass the number with unit 'ether'. Example: `1.543` means 1.543 ETH
 * @param data.options Additional options to pass into the buy request
 * @param data.signer Ethereum signer object provided by the browser
 * @param data.onProgress Callback to update UI state as execution progresses
 */
export async function buyToken(data: Data) {
  const { tokens, expectedPrice, signer, onProgress } = data
  const taker = await signer.getAddress()
  const client = getClient()
  const options = data.options || {}

  if (!client.apiBase) {
    throw new ReferenceError('ReservoirClient missing configuration')
  }

  if (!tokens || !tokens.length) {
    console.debug(data)
    throw new ReferenceError('ReservoirClient missing data')
  }

  try {
    // Construct a URL object for the `/execute/buy` endpoint
    const params: BuyTokenPathParameters = {
      taker: taker,
      source: client.source || '',
      ...options,
    }

    if (tokens.length === 1 && options.quantity) {
      params.token = `${tokens[0].contract}:${tokens[0].tokenId}`
    } else {
      tokens?.forEach(
        (token, index) =>
          //@ts-ignore
          (params[`tokens[${index}]`] = `${token.contract}:${token.tokenId}`)
      )
    }

    await executeSteps(
      {
        url: `${client.apiBase}/execute/buy/v3`,
        method: 'get',
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
