import { Execute, paths } from '../types'
import { Signer } from 'ethers'
import { getClient } from '.'
import { executeSteps } from '../utils/executeSteps'

type ListTokenBody = NonNullable<
  paths['/execute/list/v3']['post']['parameters']['body']['body']
>

type Data = {
  listings: Required<ListTokenBody>['params']
  signer: Signer
  onProgress: (steps: Execute['steps']) => any
}

/**
 * List a token for sale
 * @param data.listings Listings data to be processed
 * @param data.signer Ethereum signer object provided by the browser
 * @param data.onProgress Callback to update UI state as execution progresses
 */

export async function listToken(data: Data) {
  const { listings, signer, onProgress } = data
  const client = getClient()
  const maker = await signer.getAddress()

  if (!client.apiBase) {
    throw new ReferenceError('ReservoirClient missing configuration')
  }

  try {
    const data: ListTokenBody = {
      maker,
      source: client.source,
    }

    listings.forEach((listing) => {
      if (
        client.fee &&
        client.feeRecipient &&
        !('fee' in listing) &&
        !('feeRecipient' in listing)
      ) {
        listing.fee = client.fee
        listing.feeRecipient = client.feeRecipient
      }

      if (
        !('automatedRoyalties' in listing) &&
        'automatedRoyalties' in client
      ) {
        listing.automatedRoyalties = client.automatedRoyalties
      }
    })

    data.params = listings

    await executeSteps(
      {
        url: `${client.apiBase}/execute/list/v3`,
        method: 'post',
        data,
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
