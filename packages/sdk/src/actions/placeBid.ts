import { Execute, paths, ReservoirWallet } from '../types'
import { executeSteps, adaptViemWallet } from '../utils'
import { getClient } from '.'
import { WalletClient } from 'viem'
import { isViemWalletClient } from '../utils/viemWallet'

type PlaceBidBody = NonNullable<
  paths['/execute/bid/v5']['post']['parameters']['body']['body']
>

type Data = {
  bids: Required<PlaceBidBody>['params']
  wallet: ReservoirWallet | WalletClient
  chainId?: number
  onProgress: (steps: Execute['steps']) => any
}

/**
 * Place a bid on a token
 * @param data.bids Bidding data to be processed
 * @param data.wallet ReservoirWallet object that adheres to the ReservoirWallet interface or a viem WalletClient
 * @param data.chainId Override the current active chain
 * @param data.onProgress Callback to update UI state as execution progresses
 */
export async function placeBid({ bids, wallet, chainId, onProgress }: Data) {
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
    throw new ReferenceError('ReservoirClient missing configuration')
  }

  try {
    const data: PlaceBidBody = {
      maker,
      source: client.source || undefined,
    }

    bids.forEach((bid) => {
      if (
        !bid.token &&
        !bid.collection &&
        !bid.tokenSetId &&
        (!bid.attributeKey || !bid.attributeValue)
      ) {
        throw {
          message: 'Some bid data is missing',
          data: bid,
        }
      }
      if (
        (!bid.orderbook || bid.orderbook === 'reservoir') &&
        !('fees' in bid) &&
        !('marketplaceFees' in bid)
      ) {
        if (chain?.marketplaceFees && chain?.marketplaceFees?.length > 0) {
          bid.marketplaceFees = chain.marketplaceFees
        } else if (client.marketplaceFees && client?.marketplaceFees?.length > 0) {
          bid.marketplaceFees = client.marketplaceFees
        }
      }

      if (!('automatedRoyalties' in bid) && 'automatedRoyalties' in client) {
        bid.automatedRoyalties = client.automatedRoyalties
      }
    })

    data.params = bids

    await executeSteps(
      { url: `${baseApiUrl}/execute/bid/v5`, method: 'post', data },
      reservoirWallet,
      onProgress,
      undefined,
      undefined,
      chainId
    )
    return true
  } catch (err: any) {
    console.error(err)
    throw err
  }
}
