import { Execute, paths } from '../types'
import { Signer } from 'ethers'
import { getClient } from '.'
import { executeSteps, request } from '../utils'

type BuyTokenBodyParameters = NonNullable<
  paths['/execute/buy/v7']['post']['parameters']['body']['body']
>

export type BuyTokenOptions = Partial<
  Omit<BuyTokenBodyParameters, 'source' | 'items'>
>

type Data = {
  items: BuyTokenBodyParameters['items']
  expectedPrice?: number
  options?: BuyTokenOptions
  signer: Signer
  onProgress: (steps: Execute['steps'], path: Execute['path']) => any
}

/**
 * Instantly buy a token
 * @param data.items Array of tokens to be purchased, can also supply an order id or rawOrders to execute
 * @param data.expectedPrice Total price used to prevent to protect buyer from price moves. Pass the number with unit 'ether'. Example: `1.543` means 1.543 ETH
 * @param data.options Additional options to pass into the buy request
 * @param data.signer Ethereum signer object provided by the browser
 * @param data.onProgress Callback to update UI state as execution progresses
 */
export async function buyToken(data: Data) {
  const { items, expectedPrice, signer, onProgress } = data
  const taker = await signer.getAddress()
  const client = getClient()
  const options = data.options || {}
  const baseApiUrl = client.currentChain()?.baseApiUrl
  const errHandler = () => {
    items.forEach(({ token }) => {
      if (token) {
        const data: paths['/tokens/refresh/v1']['post']['parameters']['body']['body'] =
          {
            token,
          }
        request({
          method: 'POST',
          url: `${baseApiUrl}/tokens/refresh/v1`,
          data: JSON.stringify(data),
        }).catch(() => {})
      }
    })
  }

  if (!baseApiUrl) {
    throw new ReferenceError('ReservoirClient missing chain configuration')
  }

  try {
    const params: BuyTokenBodyParameters = {
      items,
      taker: taker,
      source: client.source || undefined,
      ...options,
    }

    if (
      client.normalizeRoyalties !== undefined &&
      params.normalizeRoyalties === undefined
    ) {
      params.normalizeRoyalties = client.normalizeRoyalties
    }
    return executeSteps(
      {
        url: `${baseApiUrl}/execute/buy/v7`,
        method: 'post',
        data: params,
      },
      signer,
      onProgress,
      undefined,
      expectedPrice
    ).catch((err: any) => {
      errHandler()
      throw err
    })
  } catch (err: any) {
    errHandler()
    throw err
  }
}
