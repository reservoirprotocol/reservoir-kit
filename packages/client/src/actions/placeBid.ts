import { Execute, paths } from '../types'
import { Signer } from 'ethers'
import { executeSteps, setParams } from '../utils'
import { getClient } from '.'

type PlaceBidPathParameters =
  paths['/execute/bid/v2']['get']['parameters']['query']
type PlaceBidPathData = Pick<
  PlaceBidPathParameters,
  'token' | 'collection' | 'attributeKey' | 'attributeValue' | 'weiPrice'
>
type PlaceBidOptions = Omit<
  PlaceBidPathParameters,
  | 'token'
  | 'collection'
  | 'attributeKey'
  | 'attributeValue'
  | 'maker'
  | 'weiPrice'
>

type Data = {
  signer: Signer
  options?: PlaceBidOptions
  onProgress: (steps: Execute['steps']) => any
} & PlaceBidPathData

/**
 * Place a bid on a token
 * @param data.token Token to bid on
 * @param data.collection Collection to bid on
 * @param data.attributeKey Token to bid on
 * @param data.attributeValue Token to bid on
 * @param data.weiPrice Price in wei to bid on the token/collection/attribute
 * @param data.signer Ethereum signer object provided by the browser
 * @param data.options Additional options to pass into the bid request
 * @param data.onProgress Callback to update UI state has execution progresses
 */
export async function placeBid(data: Data) {
  const {
    token,
    collection,
    attributeKey,
    attributeValue,
    signer,
    weiPrice,
    onProgress,
  } = data
  const client = getClient()
  const options = data.options || {}
  const maker = await signer.getAddress()

  if (!client.apiBase) {
    throw new ReferenceError('ReservoirClient missing configuration')
  }

  if (!token && !collection && (!attributeKey || !attributeValue)) {
    throw new ReferenceError('Some data is missing')
  }

  try {
    // Construct a URL object for the `/execute/bid/v2` endpoint
    const url = new URL(`${client.apiBase}/execute/bid/v2`)
    const query: PlaceBidPathParameters = {
      ...options,
      maker,
      weiPrice,
    }

    if (
      client.fee &&
      client.feeRecipient &&
      !options.fee &&
      !options.feeRecipient
    ) {
      query.fee = client.fee
      query.feeRecipient = client.feeRecipient
    }

    if (client.automatedRoyalties && !options.automatedRoyalties) {
      query.automatedRoyalties = client.automatedRoyalties
    }

    if (token) query.token = token
    if (collection) query.collection = collection
    if (attributeKey) query.attributeKey = attributeKey
    if (attributeValue) query.attributeValue = attributeValue

    setParams(url, query)

    await executeSteps(url, signer, onProgress)
    return true
  } catch (err: any) {
    console.error(err)
    throw err
  }
}
