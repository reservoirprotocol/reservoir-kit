import { Execute, paths, ReservoirWallet } from '../types'
import { getClient } from '.'
import { executeSteps, adaptViemWallet, APIError } from '../utils'
import axios, { AxiosRequestConfig } from 'axios'
import { WalletClient } from 'viem'
import { isViemWalletClient } from '../utils/viemWallet'

type CallBody = NonNullable<
  paths['/execute/call/v1']['post']['parameters']['body']['body']
>

type Data = {
  txs: CallBody['txs']
  wallet: ReservoirWallet | WalletClient
  originChainId: number
  options?: CallBody
  chainId?: number
  precheck?: boolean
  onProgress?: (steps: Execute['steps']) => any
}

/**
 * Do anything crosschain by specifying txs to be executed on the target chain.
 * @param data.txs Transaction objects made up of a to, data and value properties
 * @param data.wallet ReservoirWallet object that adheres to the ReservoirWallet interface or a viem WalletClient
 * @param data.originChainId The chain to pay the solver on
 * @param data.chainId Override the current active chain
 * @param data.precheck Set to true to skip executing steps and just to get the initial steps required
 * @param
 * @param data.onProgress Callback to update UI state as execution progresses
 */
export async function call(data: Data) {
  const {
    originChainId,
    txs,
    wallet,
    chainId,
    options,
    onProgress = () => {},
    precheck,
  } = data
  const client = getClient()
  const reservoirWallet: ReservoirWallet = isViemWalletClient(wallet)
    ? adaptViemWallet(wallet)
    : wallet
  const caller = await reservoirWallet.address()
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
    const data: CallBody = {
      user: caller,
      txs,
      originChainId,
      ...options,
    }

    const request: AxiosRequestConfig = {
      url: `${baseApiUrl}/execute/call/v1`,
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
