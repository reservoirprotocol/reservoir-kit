import { Execute, paths, ReservoirWallet } from '../types'
import { getClient } from '.'
import {
  executeSteps,
  adaptViemWallet,
  APIError,
  prepareCallTransaction,
} from '../utils'
import axios, { AxiosRequestConfig } from 'axios'
import { WalletClient, WriteContractParameters } from 'viem'
import { isViemWalletClient } from '../utils/viemWallet'

type CallBody = NonNullable<
  paths['/execute/call/v1']['post']['parameters']['body']['body']
>

type SimulateContractRequest = WriteContractParameters<any>

type Data = {
  txs: [CallBody['txs'][0] | SimulateContractRequest]
  wallet: ReservoirWallet | WalletClient
  toChainId: number
  options?: CallBody
  chainId?: number
  precheck?: boolean
  onProgress?: (steps: Execute['steps'], fees?: Execute['fees']) => any
}

function isSimulateContractRequest(tx: any): tx is SimulateContractRequest {
  return (tx as SimulateContractRequest).abi !== undefined
}

/**
 * Do anything crosschain by specifying txs to be executed on the target chain.
 * @param data.txs An array of either transaction objects (made up of a to, data and value properties) or viem request objects returned from viem's simulateContract function.
 * @param data.wallet ReservoirWallet object that adheres to the ReservoirWallet interface or a viem WalletClient
 * @param data.originChainId The chain to pay the solver on
 * @param data.chainId Override the current active chain
 * @param data.precheck Set to true to skip executing steps and just to get the initial steps required
 * @param
 * @param data.onProgress Callback to update UI state as execution progresses
 */
export async function call(data: Data) {
  const {
    toChainId,
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
  let chain = client.currentChain()
  const toChain = client.chains.find((chain) => chain.id === toChainId)
  const baseApiUrl = toChain?.baseApiUrl

  if (chainId) {
    chain = client.chains.find((chain) => chain.id === chainId) ?? null
  }

  if (!baseApiUrl || !chain || !toChain) {
    throw new ReferenceError('ReservoirClient missing chain configuration')
  }

  try {
    const preparedTransactions: CallBody['txs'] = txs.map((tx) => {
      if (isSimulateContractRequest(tx)) {
        return prepareCallTransaction(
          tx as Parameters<typeof prepareCallTransaction>['0']
        )
      }
      return tx
    })

    const data: CallBody = {
      user: caller,
      txs: preparedTransactions,
      originChainId: chain.id,
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
      onProgress(data['steps'], data['fees'])
      return data
    } else {
      await executeSteps(
        request,
        reservoirWallet,
        (steps, path, fees) => {
          onProgress(steps, fees)
        },
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
