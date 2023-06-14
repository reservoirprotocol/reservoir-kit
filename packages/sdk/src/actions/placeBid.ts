import { Execute, paths } from '../types'
import { WalletClient } from 'viem'
import { executeSteps } from '../utils'
import { getClient } from '.'

type PlaceBidBody = NonNullable<
  paths['/execute/bid/v5']['post']['parameters']['body']['body']
>

type Data = {
  bids: Required<PlaceBidBody>['params']
  signer: WalletClient
  chainId?: number
  onProgress: (steps: Execute['steps']) => any
}

/**
 * Place a bid on a token
 * @param data.bids Bidding data to be processed
 * @param data.signer Ethereum signer object provided by the browser
 * @param data.chainId Override the current active chain
 * @param data.onProgress Callback to update UI state as execution progresses
 */
export async function placeBid({ bids, signer, chainId, onProgress }: Data) {
  const client = getClient()
  let maker = signer.account?.address
  if (!maker) {
    ;[maker] = await signer.getAddresses()
  }
  let baseApiUrl = client.currentChain()?.baseApiUrl

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
        client.marketplaceFees &&
        !('fees' in bid)
      ) {
        bid.fees = client.marketplaceFees
      }

      if (!('automatedRoyalties' in bid) && 'automatedRoyalties' in client) {
        bid.automatedRoyalties = client.automatedRoyalties
      }
    })

    data.params = bids

    await executeSteps(
      { url: `${baseApiUrl}/execute/bid/v5`, method: 'post', data },
      signer,
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
