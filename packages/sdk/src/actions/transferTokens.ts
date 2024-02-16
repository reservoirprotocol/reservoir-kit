import { Execute, paths, ReservoirWallet } from '../types'
import { getClient } from '.'
import { executeSteps, adaptViemWallet, APIError } from '../utils'
import { axios } from '../utils'
import { AxiosRequestConfig } from 'axios'
import { Address, WalletClient } from 'viem'
import { isViemWalletClient } from '../utils/viemWallet'

type TransferTokenBody = NonNullable<
  paths['/execute/transfer/v1']['post']['parameters']['body']['body']
>

type Data = {
  to: Address
  items: TransferTokenBody['items']
  wallet: ReservoirWallet | WalletClient
  chainId?: number
  precheck?: boolean
  onProgress?: (steps: Execute['steps']) => any
}

/**
 * Batch transfer tokens
 * @param data.to Address to transfer tokens to
 * @param data.items List of items to transfer
 * @param data.wallet ReservoirWallet object that adheres to the ReservoirWallet interface or a viem WalletClient
 * @param data.chainId Override the current active chain
 * @param data.precheck Set to true to skip executing steps and just to get the initial steps required
 * @param data.onProgress Callback to update UI state as execution progresses
 */
export async function transferTokens(data: Data) {
  const { to, items, wallet, chainId, onProgress = () => {}, precheck } = data
  const client = getClient()
  const reservoirWallet: ReservoirWallet = isViemWalletClient(wallet)
    ? adaptViemWallet(wallet)
    : wallet
  const maker = await reservoirWallet.address()
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
    const data: TransferTokenBody = {
      to,
      from: maker,
      items,
    }

    const request: AxiosRequestConfig = {
      url: `${baseApiUrl}/execute/transfer/v1`,
      method: 'post',
      data,
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

      const res = await axios.request(request)
      if (res.status !== 200)
        throw new APIError(res?.data?.message, res.status, res.data)
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
      return true
    }
  } catch (err: any) {
    console.error(err)
    throw err
  }
}
