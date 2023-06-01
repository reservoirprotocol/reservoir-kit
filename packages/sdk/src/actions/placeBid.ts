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
  onProgress: (steps: Execute['steps']) => any
}

/**
 * Place a bid on a token
 * @param data.bids Bidding data to be processed
 * @param data.signer Ethereum signer object provided by the browser
 * @param data.onProgress Callback to update UI state as execution progresses
 */
export async function placeBid({ bids, signer, onProgress }: Data) {
  const client = getClient()
  const [maker] = await signer.getAddresses()
  const baseApiUrl = client.currentChain()?.baseApiUrl

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
        client.marketplaceFee &&
        client.marketplaceFeeRecipient &&
        !('fees' in bid)
      ) {
        bid.fees = [
          `${client.marketplaceFeeRecipient}:${client.marketplaceFee}`,
        ]
      }

      if (!('automatedRoyalties' in bid) && 'automatedRoyalties' in client) {
        bid.automatedRoyalties = client.automatedRoyalties
      }
    })

    data.params = bids

    await executeSteps(
      { url: `${baseApiUrl}/execute/bid/v5`, method: 'post', data },
      signer,
      onProgress
    )
    return true
  } catch (err: any) {
    console.error(err)
    throw err
  }
}
