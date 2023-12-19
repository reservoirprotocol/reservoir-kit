import { Execute, paths, ReservoirWallet } from '../types'
import { executeSteps, adaptViemWallet } from '../utils'
import { getClient } from '.'
import { WalletClient } from 'viem'
import { isViemWalletClient } from '../utils/viemWallet'

type CancelOrderBodyParameters =
  paths['/execute/cancel/v3']['post']['parameters']['body']

export type CancelOrderOptions = Omit<
  NonNullable<CancelOrderBodyParameters['body']>,
  'orderIds'
>

type Data = {
  ids: string[]
  wallet: ReservoirWallet | WalletClient
  options?: CancelOrderOptions
  chainId?: number
  onProgress: (steps: Execute['steps']) => any
  gas?: string
  context?: string
}

/**
 * Cancel offers or listings
 * @param data.ids Ids of the orders to cancel
 * @param data.wallet ReservoirWallet object that adheres to the ReservoirWallet interface or a viem WalletClient
 * @param data.options Additional options to pass into the cancel request
 * @param data.chainId Override the current active chain
 * @param data.onProgress Callback to update UI state has execution progresses
 * @param data.gas String of the gas provided for the transaction execution. It will return unused gas
 */
export async function cancelOrder(data: Data) {
  const { ids, wallet, chainId, onProgress, gas, context } = data
  const client = getClient()
  const reservoirWallet: ReservoirWallet = isViemWalletClient(wallet)
    ? adaptViemWallet(wallet)
    : wallet
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

  if (ids.length === 0) {
    throw {
      message: 'No order ids specified',
    }
  }

  try {
    await executeSteps(
      {
        method: 'post',
        url: `${baseApiUrl}/execute/cancel/v3`,
        data: {
          orderIds: ids,
          ...options,
        } as NonNullable<CancelOrderBodyParameters['body']>,
      },
      reservoirWallet,
      onProgress,
      undefined,
      undefined,
      chainId,
      gas,
      context
    )
    return true
  } catch (err: any) {
    console.error(err)
    throw err
  }
}
