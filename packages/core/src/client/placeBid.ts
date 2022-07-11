import { Execute, paths } from '../types'
import { Signer } from 'ethers'
import { executeSteps, setParams } from '../utils'
import { ReservoirSDK } from '.'

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
  const client = ReservoirSDK.client()
  const options = data.options || {}
  const maker = await signer.getAddress()

  if (!client.apiBase) {
    throw new ReferenceError('ReservoirSDK missing configuration')
  }

  if (!token && !collection && (!attributeKey || !attributeValue)) {
    throw new ReferenceError('Some data is missing')
  }

  try {
    // Construct a URL object for the `/execute/bid/v2` endpoint
    const url = new URL('/execute/bid/v2', client.apiBase)
    const query: PlaceBidPathParameters = {
      fee: client.fee,
      feeRecipient: client.feeRecipient,
      automatedRoyalties: client.automatedRoyalties,
      ...options,
      maker,
      weiPrice,
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
