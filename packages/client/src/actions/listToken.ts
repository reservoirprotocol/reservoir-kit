import { BatchExecute, paths } from '../types'
import { Signer } from 'ethers'
import { getClient } from '.'
import { batchExecuteSteps } from '../utils/batchExecuteSteps'

type ListTokenPathBody = NonNullable<
  paths['/execute/list/v3']['post']['parameters']['body']['body']
>

type Data = {
  signer: Signer
  source: ListTokenPathBody['source']
  listings: Required<ListTokenPathBody>['params']
  onProgress: (steps: BatchExecute['steps']) => any
}

/**
 * List a token for sale
 * @param data.listings Listings data to be processed
 * @param data.signer Ethereum signer object provided by the browser
 * @param data.onProgress Callback to update UI state has execution progresses
 */

export async function listToken(data: Data) {
  const { source, listings, signer, onProgress } = data
  const client = getClient()
  const maker = await signer.getAddress()

  if (!client.apiBase) {
    throw new ReferenceError('ReservoirClient missing configuration')
  }

  try {
    const data: ListTokenPathBody = {
      maker,
    }

    if (source) {
      data.source = source
    }

    listings.forEach((listing) => {
      if (
        !listing.fee &&
        !listing.feeRecipient &&
        client.fee &&
        client.feeRecipient
      ) {
        listing.fee = client.fee
        listing.feeRecipient = client.feeRecipient
      }

      if (
        typeof listing.automatedRoyalties === 'undefined' &&
        client.automatedRoyalties
      ) {
        listing.automatedRoyalties = client.automatedRoyalties
      }
    })

    data.params = listings

    await batchExecuteSteps(
      {
        url: `${client.apiBase}/execute/list/v3`,
        method: 'post',
        data: data,
      },
      signer,
      onProgress
    )
    return true
  } catch (err: any) {
    console.error(err)
    throw err
  }
}
