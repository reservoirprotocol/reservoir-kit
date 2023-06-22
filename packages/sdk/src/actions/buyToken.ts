import { Execute, paths, ReservoirWallet } from '../types'
import { getClient } from '.'
import { executeSteps, request, adaptViemWallet } from '../utils'
import axios, { AxiosRequestConfig } from 'axios'
import { WalletClient } from 'viem'
import { isViemWalletClient } from '../utils/viemWallet'

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
  wallet: ReservoirWallet | WalletClient
  chainId?: number
  onProgress: (steps: Execute['steps'], path: Execute['path']) => any
  precheck?: boolean
}

/**
 * Instantly buy a token
 * @param data.items Array of tokens to be purchased, can also supply an order id or rawOrders to execute
 * @param data.expectedPrice Total price used to prevent to protect buyer from price moves. Pass the number with unit 'ether'. Example: `1.543` means 1.543 ETH
 * @param data.options Additional options to pass into the buy request
 * @param data.wallet ReservoirWallet object that adheres to the ReservoirWallet interface or a viem WalletClient
 * @param data.chainId Override the current active chain
 * @param data.onProgress Callback to update UI state as execution progresses
 * @param data.precheck Set to true to skip executing steps and just to get the initial steps/path
 */
export async function buyToken(data: Data) {
  const { items, expectedPrice, wallet, chainId, onProgress, precheck } = data
  const client = getClient()
  const reservoirWallet: ReservoirWallet = isViemWalletClient(wallet)
    ? adaptViemWallet(wallet)
    : wallet
  const taker = await reservoirWallet.address()
  const options = data.options || {}
  let baseApiUrl = client.currentChain()?.baseApiUrl
  if (chainId) {
    baseApiUrl =
      client.chains.find((chain) => chain.id === chainId)?.baseApiUrl ||
      baseApiUrl
  }
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

    const request: AxiosRequestConfig = {
      url: `${baseApiUrl}/execute/buy/v7`,
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
      return executeSteps(
        request,
        reservoirWallet,
        onProgress,
        undefined,
        expectedPrice,
        chainId
      )
    }
  } catch (err: any) {
    errHandler()
    throw err
  }
}
