import { getClient } from '.'
import { Execute, paths } from '../types'
import { executeSteps, request } from '../utils'
import { WalletClient } from 'viem'

type AcceptOfferBodyParameters =
  paths['/execute/sell/v7']['post']['parameters']['body']['body']

export type AcceptOfferOptions = Omit<
  NonNullable<AcceptOfferBodyParameters>,
  'items'
>

type Data = {
  items: NonNullable<AcceptOfferBodyParameters>['items']
  options?: Partial<AcceptOfferOptions>
  expectedPrice?: number
  signer: WalletClient
  onProgress: (steps: Execute['steps']) => any
}

/**
 * Accept an offer to buy your token
 * @param data.items Items being accepted
 * @param data.expectedPrice Token price used to prevent to protect buyer from price moves. Pass the number with unit 'ether'. Example: `1.543` means 1.543 ETH
 * @param data.signer Ethereum signer object provided by the browser
 * @param data.options Additional options to pass into the accept request
 * @param data.onProgress Callback to update UI state as execution progresses
 */
export async function acceptOffer(data: Data) {
  const { items, expectedPrice, signer, onProgress } = data
  const [taker] = await signer.getAddresses()
  const client = getClient()
  const options = data.options || {}
  const baseApiUrl = client.currentChain()?.baseApiUrl

  if (!client.currentChain()) {
    throw new ReferenceError('ReservoirClient missing chain configuration')
  }

  try {
    const params: AcceptOfferBodyParameters = {
      items,
      taker: taker,
      source: client.source || undefined,
      ...options,
    }

    if (
      client.normalizeRoyalties !== undefined &&
      params.normalizeRoyalties === undefined
    ) {
      params.normalizeRoyalties = client.normalizeRoyalties
    }

    await executeSteps(
      {
        url: `${baseApiUrl}/execute/sell/v7`,
        method: 'post',
        data: params,
      },
      signer,
      onProgress,
      undefined,
      expectedPrice
    )
    return true
  } catch (err: any) {
    items.forEach(({ token }) => {
      const data: paths['/tokens/refresh/v1']['post']['parameters']['body']['body'] =
        {
          token: token,
        }
      request({
        method: 'POST',
        url: `${baseApiUrl}/tokens/refresh/v1`,
        data: JSON.stringify(data),
      }).catch(() => {})
    })
    throw err
  }
}
