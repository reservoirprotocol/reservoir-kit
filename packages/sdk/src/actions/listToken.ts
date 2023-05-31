import { Execute, paths } from '../types'
import { WalletClient } from 'viem'
import { getClient } from '.'
import { executeSteps } from '../utils/executeSteps'
import { axios } from '../utils'
import { AxiosRequestConfig } from 'axios'
import { version } from '../../package.json'

type ListTokenBody = NonNullable<
  paths['/execute/list/v5']['post']['parameters']['body']['body']
>

type Data = {
  listings: Required<ListTokenBody>['params']
  signer: WalletClient
  chainId?: number
  precheck?: boolean
  onProgress?: (steps: Execute['steps']) => any
}

/**
 * List a token for sale
 * @param data.listings Listings data to be processed
 * @param data.signer Ethereum signer object provided by the browser
 * @param data.chainId Override the current active chain
 * @param data.precheck Set to true to skip executing steps and just to get the initial steps required
 * @param data.onProgress Callback to update UI state as execution progresses
 */

export async function listToken(
  data: Data
): Promise<Execute['steps'] | boolean> {
  const { listings, signer, chainId, onProgress = () => {}, precheck } = data
  const client = getClient()
  const [maker] = await signer.getAddresses()
  let baseApiUrl = client.currentChain()?.baseApiUrl

  if (chainId) {
    baseApiUrl =
      client.chains.find((chain) => chain.id === chainId)?.baseApiUrl ||
      baseApiUrl
  }

  if (!baseApiUrl) {
    throw new ReferenceError('ReservoirClient missing chain configuration')
  }

  try {
    const data: ListTokenBody = {
      maker,
      source: client.source || undefined,
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
      url: `${baseApiUrl}/execute/list/v5`,
      method: 'post',
      data,
      headers: {
        'x-rkc-version': version,
      },
    }

    if (precheck) {
      const apiKey = client.currentChain()?.apiKey
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
      return data['steps']
    } else {
      await executeSteps(
        request,
        signer,
        onProgress,
        undefined,
        undefined,
        chainId
      )
    }

    return true
  } catch (err: any) {
    console.error(err)
    throw err
  }
}
