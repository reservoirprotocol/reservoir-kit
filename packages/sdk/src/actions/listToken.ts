import { Execute, paths } from '../types'
import { Signer } from 'ethers'
import { getClient } from '.'
import { executeSteps } from '../utils/executeSteps'
import axios, { AxiosRequestConfig } from 'axios'
import { version } from '../../package.json'

type ListTokenBody = NonNullable<
  paths['/execute/list/v4']['post']['parameters']['body']['body']
>

type Data = {
  listings: Required<ListTokenBody>['params']
  signer: Signer
  onProgress?: (steps: Execute['steps']) => any
  precheck?: boolean
}

/**
 * List a token for sale
 * @param data.listings Listings data to be processed
 * @param data.signer Ethereum signer object provided by the browser
 * @param data.onProgress Callback to update UI state as execution progresses
 * @param data.precheck Set to true to skip executing steps and just to get the initial steps required
 */

export async function listToken(
  data: Data
): Promise<Execute['steps'] | boolean> {
  const { listings, signer, onProgress = () => {}, precheck } = data
  const client = getClient()
  const maker = await signer.getAddress()

  if (!client.apiBase) {
    throw new ReferenceError('ReservoirClient missing configuration')
  }

  try {
    const data: ListTokenBody = {
      maker,
      source: client.source || '',
    }

    listings.forEach((listing) => {
      if (
        (!listing.orderbook || listing.orderbook === 'reservoir') &&
        client.marketplaceFee &&
        client.marketplaceFeeRecipient &&
        !('fees' in listing)
      ) {
        listing.fees = [
          `${client.marketplaceFeeRecipient}:${client.marketplaceFee}`,
        ]
      }

      if (
        !('automatedRoyalties' in listing) &&
        'automatedRoyalties' in client
      ) {
        listing.automatedRoyalties = client.automatedRoyalties
      }
    })

    data.params = listings

    const request: AxiosRequestConfig = {
      url: `${client.apiBase}/execute/list/v4`,
      method: 'post',
      data,
      headers: {
        'x-rkc-version': version,
      },
    }

    if (precheck) {
      if (client?.apiKey && request.headers) {
        request.headers['x-api-key'] = client.apiKey
      }
      if (client?.uiVersion && request.headers) {
        request.headers['x-rkui-version'] = client.uiVersion
      }

      const res = await axios.request(request)
      if (res.status !== 200) throw res.data
      const data = res.data as Execute
      onProgress(data['steps'])
      return data['steps']
    } else {
      await executeSteps(request, signer, onProgress)
    }

    return true
  } catch (err: any) {
    console.error(err)
    throw err
  }
}
