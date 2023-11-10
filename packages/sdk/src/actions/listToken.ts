import { Execute, paths, ReservoirWallet } from '../types'
import { getClient } from '.'
import { executeSteps, adaptViemWallet } from '../utils'
import { axios } from '../utils'
import { AxiosRequestConfig } from 'axios'
import { version } from '../../package.json'
import { isViemWalletClient } from '../utils/viemWallet'
import { WalletClient } from 'viem'

type ListTokenBody = NonNullable<
  paths['/execute/list/v5']['post']['parameters']['body']['body']
>

type Data = {
  listings: Required<ListTokenBody>['params']
  wallet: ReservoirWallet | WalletClient
  chainId?: number
  precheck?: boolean
  onProgress?: (steps: Execute['steps']) => any
}

/**
 * List a token for sale
 * @param data.listings Listings data to be processed
 * @param data.wallet ReservoirWallet object that adheres to the ReservoirWallet interface or a viem WalletClient
 * @param data.chainId Override the current active chain
 * @param data.precheck Set to true to skip executing steps and just to get the initial steps required
 * @param data.onProgress Callback to update UI state as execution progresses
 */

export async function listToken(
  data: Data
): Promise<Execute['steps'] | boolean> {
  const { listings, wallet, chainId, onProgress = () => {}, precheck } = data
  const client = getClient()
  const reservoirWallet: ReservoirWallet = isViemWalletClient(wallet)
    ? adaptViemWallet(wallet)
    : wallet
  const maker = await reservoirWallet.address()
  const chain = client.currentChain()

  let baseApiUrl = chain?.baseApiUrl

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
        !('fees' in listing) &&
        !('marketplaceFees' in listing)
      ) {
        if (chain?.marketplaceFees && chain?.marketplaceFees?.length > 0) {
          listing.marketplaceFees = chain.marketplaceFees
        } else if (client.marketplaceFees && client?.marketplaceFees?.length > 0) {
          listing.marketplaceFees = client.marketplaceFees
        }
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
      const apiKey = client?.apiKey
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
        reservoirWallet,
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
