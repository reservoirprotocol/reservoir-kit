import { Execute, ExpectedPrice, paths, ReservoirWallet } from '../types'
import { getClient } from '.'
import {
  executeSteps,
  adaptViemWallet,
  APIError,
  isAPIError,
  refreshLiquidity,
} from '../utils'
import { AxiosRequestConfig } from 'axios'
import { WalletClient } from 'viem'
import { isViemWalletClient } from '../utils/viemWallet'
import { request as apiRequest } from '../utils'

type MintTokenBodyParameters = NonNullable<
  paths['/execute/mint/v1']['post']['parameters']['body']['body']
>

export type MintTokenOptions = Partial<
  Omit<MintTokenBodyParameters, 'source' | 'items'>
>

type Data = {
  items: MintTokenBodyParameters['items']
  expectedPrice?: Record<string, ExpectedPrice>
  options?: MintTokenOptions
  wallet: ReservoirWallet | WalletClient
  chainId?: number
  onProgress: (steps: Execute['steps'], path: Execute['path']) => any
  precheck?: boolean
  gas?: string
  context?: string
}

/**
 * Instantly buy a token
 * @param data.items Array of tokens to be purchased, can also supply an order id or rawOrders to execute
 * @param data.expectedPrice Token price data used to protect buyer from price moves. Pass an object detailing the amount or/and raw amount with currency details. The raw amount will be more precise.
 * @param data.options Additional options to pass into the buy request
 * @param data.wallet ReservoirWallet object that adheres to the ReservoirWallet interface or a viem WalletClient
 * @param data.chainId Override the current active chain
 * @param data.onProgress Callback to update UI state as execution progresses
 * @param data.precheck Set to true to skip executing steps and just to get the initial steps/path
 * @param data.gas String of the gas provided for the transaction execution. It will return unused gas
 */
export async function mintToken(data: Data) {
  const {
    items,
    expectedPrice,
    wallet,
    chainId,
    onProgress,
    precheck,
    gas,
    context,
  } = data
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

  if (!baseApiUrl) {
    throw new ReferenceError('ReservoirClient missing chain configuration')
  }

  try {
    const params: MintTokenBodyParameters = {
      items,
      taker: taker,
      source: client.source || undefined,
      ...options,
    }

    if (client.bountyReferrer !== undefined && params.referrer === undefined) {
      params.referrer = client.bountyReferrer
    }

    const request: AxiosRequestConfig = {
      url: `${baseApiUrl}/execute/mint/v1`,
      method: 'post',
      data: params,
    }

    if (precheck) {
      const apiKey = client?.apiKey
      if (!request.headers) {
        request.headers = {}
      }

      if (apiKey && request.headers) {
        request.headers['x-api-key'] = apiKey
      }
      if (client?.uiVersion && request.headers) {
        request.headers['x-rkui-version'] = client.uiVersion
      }

      if (context && request.headers) {
        request.headers['x-rkui-context'] = context
      }

      const res = await apiRequest(request)
      if (res.status !== 200)
        throw new APIError(res?.data?.message, res.status, res.data)
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
        chainId,
        gas,
        context
      )
      return true
    }
  } catch (err: any) {
    if (isAPIError(err)) {
      items.forEach(({ token }) => {
        if (baseApiUrl && token) {
          refreshLiquidity(baseApiUrl, token)
        }
      })
    }
    throw err
  }
}
