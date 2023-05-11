import { Signer } from 'ethers'
import { getClient } from '.'
import { Execute, paths } from '../types'
import { executeSteps, request } from '../utils'
import axios, { AxiosRequestConfig } from 'axios'

type AcceptOfferBodyParameters =
  paths['/execute/sell/v7']['post']['parameters']['body']['body']

export type AcceptOfferOptions = Omit<
  NonNullable<AcceptOfferBodyParameters>,
  'items'
>

type Data = {
  items: NonNullable<AcceptOfferBodyParameters>['items']
  options?: Partial<AcceptOfferOptions>
  expectedPrice?: number | Record<string, number>
  signer: Signer
  onProgress: (steps: Execute['steps']) => any
  precheck?: boolean
}

/**
 * Accept an offer to buy your token
 * @param data.items Items being accepted
 * @param data.expectedPrice Token price used to prevent to protect buyer from price moves. Pass the number with unit 'ether'. Example: `1.543` means 1.543 ETH
 * @param data.signer Ethereum signer object provided by the browser
 * @param data.options Additional options to pass into the accept request
 * @param data.onProgress Callback to update UI state as execution progresses
 * @param data.precheck Set to true to skip executing steps and just to get the initial steps/path
 */
export async function acceptOffer(data: Data) {
  const { items, expectedPrice, signer, onProgress, precheck } = data
  const taker = await signer.getAddress()
  const client = getClient()
  const options = data.options || {}
  const baseApiUrl = client.currentChain()?.baseApiUrl

  if (!client.currentChain()) {
    throw new ReferenceError('ReservoirClient missing chain configuration')
  }

  try {
    const params: AcceptOfferBodyParameters = {
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

    const request: AxiosRequestConfig = {
      url: `${baseApiUrl}/execute/sell/v7`,
      method: 'post',
      data: params,
    }

    if (precheck) {
      const apiKey = client.currentChain()?.apiKey
      if (!request.headers) {
        request.headers = {}
      }

      if (apiKey && request.headers) {
        request.headers['x-api-key'] = apiKey
      }
      if (client?.uiVersion && request.headers) {
        request.headers['x-rkui-version'] = client.uiVersion
      }

      const res = await axios.request(request)
      if (res.status !== 200) throw res.data
      const data = res.data as Execute
      onProgress(data['steps'])
      return data
    } else {
      await executeSteps(request, signer, onProgress, undefined, expectedPrice)
      return true
    }
  } catch (err: any) {
    items.forEach(({ token }) => {
      const data: paths['/tokens/refresh/v1']['post']['parameters']['body']['body'] =
        {
          token: token,
        }
      request({
        method: 'POST',
        url: `${baseApiUrl}/tokens/refresh/v1`,
        data: JSON.stringify(data),
      }).catch(() => {})
    })
    throw err
  }
}
