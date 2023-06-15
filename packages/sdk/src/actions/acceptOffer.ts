import { getClient } from '.'
import { Execute, paths } from '../types'
import { executeSteps, request, adaptViemWallet } from '../utils'
import { WalletClient } from 'viem'
import axios, { AxiosRequestConfig } from 'axios'
import { ReservoirWallet } from '../types/reservoirWallet'
import { isViemWalletClient } from '../utils/viemWallet'

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
  wallet: ReservoirWallet | WalletClient
  chainId?: number
  onProgress: (steps: Execute['steps'], path: Execute['path']) => any
  precheck?: boolean
}

/**
 * Accept an offer to buy your token
 * @param data.items Items being accepted
 * @param data.expectedPrice Token price used to prevent to protect buyer from price moves. Pass the number with unit 'ether'. Example: `1.543` means 1.543 ETH
 * @param data.wallet ReservoirWallet object that adheres to the ReservoirWallet interface or a viem WalletClient
 * @param data.options Additional options to pass into the accept request
 * @param data.chainId Override the current active chain
 * @param data.onProgress Callback to update UI state as execution progresses
 * @param data.precheck Set to true to skip executing steps and just to get the initial steps/path
 */
export async function acceptOffer(data: Data) {
  const { items, expectedPrice, wallet, chainId, onProgress, precheck } = data
  const reservoirWallet: ReservoirWallet = isViemWalletClient(wallet)
    ? adaptViemWallet(wallet)
    : wallet

  const taker = await reservoirWallet.address()

  const client = getClient()
  const options = data.options || {}
  let baseApiUrl = client.currentChain()?.baseApiUrl

  if (chainId) {
    baseApiUrl =
      client.chains.find((chain) => chain.id === chainId)?.baseApiUrl ||
      baseApiUrl
  }

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
      onProgress(data['steps'], data['path'])
      return data
    } else {
      await executeSteps(
        request,
        reservoirWallet,
        onProgress,
        undefined,
        expectedPrice,
        chainId
      )
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
