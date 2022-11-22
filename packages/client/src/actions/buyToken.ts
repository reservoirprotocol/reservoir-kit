import { Execute, paths } from '../types'
import { Signer } from 'ethers'
import { getClient } from '.'
import { executeSteps } from '../utils/executeSteps'
import axios, { AxiosRequestHeaders } from 'axios'
import { version } from '../../package.json'

export type Token = Pick<
  NonNullable<
    NonNullable<
      paths['/tokens/v5']['get']['responses']['200']['schema']['tokens']
    >[0]['token']
  >,
  'tokenId' | 'contract'
>

type BuyTokenBodyParameters = NonNullable<
  paths['/execute/buy/v6']['post']['parameters']['body']['body']
>

export type BuyTokenOptions = Omit<
  BuyTokenBodyParameters,
  'taker' | 'source' | 'tokens' | 'orderIds' | 'rawOrders'
>
export type BuyTokenRequiredOptions = Pick<
  BuyTokenBodyParameters,
  'orderIds' | 'rawOrders'
>

type Data = BuyTokenRequiredOptions & {
  tokens?: Token[]
  expectedPrice?: number
  options?: BuyTokenOptions
  signer: Signer
  onProgress: (steps: Execute['steps']) => any
}

/**
 * Instantly buy a token
 * @param data.tokens Tokens to be purchased (mutually exclusive with rawOrders and orderIds)
 * @param data.orderIds OrderIds to be purchased (mutually exclusive with tokens and rawOrders)
 * @param data.rawOrders RawOrders to be purchased (mutually exclusive with tokens and orderIds)
 * @param data.expectedPrice Token price used to prevent to protect buyer from price moves. Pass the number with unit 'ether'. Example: `1.543` means 1.543 ETH
 * @param data.options Additional options to pass into the buy request
 * @param data.signer Ethereum signer object provided by the browser
 * @param data.onProgress Callback to update UI state as execution progresses
 */
export async function buyToken(data: Data) {
  const { tokens, orderIds, rawOrders, expectedPrice, signer, onProgress } =
    data
  const taker = await signer.getAddress()
  const client = getClient()
  const options = data.options || {}

  if (!client.apiBase) {
    throw new ReferenceError('ReservoirClient missing configuration')
  }

  if (
    (!tokens || !tokens.length) &&
    (!data.orderIds || !data.orderIds.length) &&
    !data.rawOrders
  ) {
    console.debug(data)
    throw new ReferenceError(
      'ReservoirClient missing data: At least one of the following is required, tokens, orderIds or rawOrders'
    )
  }

  if (
    (tokens && (orderIds || rawOrders)) ||
    (orderIds && (tokens || rawOrders)) ||
    (rawOrders && (orderIds || tokens))
  ) {
    console.debug(data)
    throw new ReferenceError(
      'ReservoirClient conflicting data: tokens, orderIds and rawOrders are mutually exclusive'
    )
  }

  try {
    const params: BuyTokenBodyParameters = {
      taker: taker,
      source: client.source || '',
      ...options,
    }

    if (
      client.referralFeeRecipient &&
      client.referralFee &&
      !options.feesOnTop
    ) {
      params.feesOnTop = [
        `${client.referralFeeRecipient}:${client.referralFee}`,
      ]
    }

    if (tokens) {
      params.tokens = tokens?.map(
        (token) => `${token.contract}:${token.tokenId}`
      )
    } else if (orderIds) {
      params.orderIds = orderIds
    } else if (rawOrders) {
      params.rawOrders = rawOrders
    }

    if (
      client.normalizeRoyalties !== undefined &&
      params.normalizeRoyalties === undefined
    ) {
      params.normalizeRoyalties = client.normalizeRoyalties
    }

    await executeSteps(
      {
        url: `${client.apiBase}/execute/buy/v6`,
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
    if (tokens) {
      const headers: AxiosRequestHeaders = {
        'Content-Type': 'application/json',
        'x-rkc-version': version,
      }
      if (client?.apiKey) {
        headers['x-api-key'] = client.apiKey
      }
      tokens.forEach((token) => {
        const data: paths['/tokens/simulate-floor/v1']['post']['parameters']['body']['body'] =
          {
            router: 'v6',
            token: `${token.contract}:${token.tokenId}`,
          }

        axios.post(
          `${client.apiBase}/tokens/simulate-floor/v1`,
          JSON.stringify(data),
          {
            method: 'POST',
            headers,
          }
        )
      })
    }
    throw err
  }
}
