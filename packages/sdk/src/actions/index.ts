import actions from './actions'
import * as utils from '../utils'
import { version } from '../../package.json'

export type ReservoirChain = {
  id: number
  baseApiUrl: string
  default: boolean
  apiKey?: string
}

/**
 * ReservoirClient Configuration Options
 * @param chains List of chain objects with configuration (id, baseApiUrl, apiKey and if it's the default)
 * @param source Used to manually override the source domain used to attribute local orders
 * @param automatedRoyalties If true, royalties will be automatically included, defaults to true. Only relevant for creating orders.
 * @param marketplaceFee Fee in bps included when creating an order (listing & bidding)
 * @param marketplaceFeeRecipient Marketplace fee recipient
 * @param normalizeRoyalties Normalize orders that don't have royalties by apply royalties on top of them
 */
export type ReservoirClientOptions = {
  chains: ReservoirChain[]
  uiVersion?: string
  source?: string
  automatedRoyalties?: boolean
  marketplaceFee?: number
  marketplaceFeeRecipient?: string
  normalizeRoyalties?: boolean
}

export type ReservoirClientActions = typeof actions

let _client: ReservoirClient

export class ReservoirClient {
  version: string
  chains: ReservoirChain[]
  source?: string
  uiVersion?: string
  marketplaceFee?: number
  marketplaceFeeRecipient?: string
  automatedRoyalties?: boolean
  normalizeRoyalties?: boolean

  readonly utils = { ...utils }
  readonly actions: ReservoirClientActions = actions

  constructor(options: ReservoirClientOptions) {
    this.version = version
    this.chains = options.chains
    this.uiVersion = options.uiVersion
    this.automatedRoyalties = options.automatedRoyalties
    this.marketplaceFee = options.marketplaceFee
    this.marketplaceFeeRecipient = options.marketplaceFeeRecipient
    this.normalizeRoyalties = options.normalizeRoyalties
    this.source = options.source

    if (!options.source) {
      console.warn(
        'ReservoirClient detected that no source was set, we recommend providing a source when initializing the ReservoirSDK or ReservoirKit. Refer to our docs for steps on how to do this: http://docs.reservoir.tools'
      )
    }
  }

  configure(options: ReservoirClientOptions) {
    this.source = options.source ? options.source : this.source
    this.uiVersion = options.uiVersion ? options.uiVersion : this.uiVersion
    this.chains = options.chains ? options.chains : this.chains
    this.marketplaceFee = options.marketplaceFee
      ? options.marketplaceFee
      : this.marketplaceFee
    this.marketplaceFeeRecipient = options.marketplaceFeeRecipient
      ? options.marketplaceFeeRecipient
      : this.marketplaceFeeRecipient
    this.automatedRoyalties = options.automatedRoyalties
    this.normalizeRoyalties =
      options.normalizeRoyalties !== undefined
        ? options.normalizeRoyalties
        : this.normalizeRoyalties
  }

  currentChain() {
    if (this.chains && this.chains.length > 0) {
      const defaultChain = this.chains.find((chain) => chain.default)
      if (defaultChain) {
        return defaultChain
      }
      return this.chains[0]
    }
    return null
  }
}

export function getClient() {
  //throw an error
  return _client
}

export function createClient(options: ReservoirClientOptions) {
  if (!_client) {
    _client = new ReservoirClient(options)
  } else {
    _client.configure(options)
  }

  return _client
}
