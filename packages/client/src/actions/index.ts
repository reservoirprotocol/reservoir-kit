import actions from './actions'
import * as utils from '../utils'
import { version } from '../../package.json'

/**
 * ReservoirClient Configuration Options
 * @param apiBase Base api for all reservoir apis, e.g. 'https://api.reservoir.tools'
 * @param apiKey Reservoir API key to be applied to all api
 * @param source Used to manually override the source domain used to attribute local orders
 * @param automatedRoyalties If true, royalties will be automatically included, defaults to true. Only relevant for creating orders.
 * @param marketplaceFee Fee in bps included when creating an order (listing & bidding)
 * @param marketplaceFeeRecipient Marketplace fee recipient
 * @param normalizeRoyalties Normalize orders that don't have royalties by apply royalties on top of them
 */
export type ReservoirClientOptions = {
  apiBase: string
  apiKey?: string
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
  apiBase: string
  source?: string
  apiKey?: string
  uiVersion?: string
  marketplaceFee?: number
  marketplaceFeeRecipient?: string
  automatedRoyalties?: boolean
  normalizeRoyalties?: boolean

  readonly utils = { ...utils }
  readonly actions: ReservoirClientActions = actions

  constructor(options: ReservoirClientOptions) {
    this.version = version
    this.apiKey = options.apiKey
    this.uiVersion = options.uiVersion
    this.apiBase = options.apiBase
    this.automatedRoyalties = options.automatedRoyalties
    this.marketplaceFee = options.marketplaceFee
    this.marketplaceFeeRecipient = options.marketplaceFeeRecipient
    this.normalizeRoyalties = options.normalizeRoyalties

    if (!options.source) {
      if (typeof window !== 'undefined') {
        let host = location.hostname
        if (host.indexOf('www.') === 0) {
          host = host.replace('www.', '')
        }
        this.source = host
        console.warn(
          'ReservoirKit automatically generated a source based on the url, we recommend providing a source when initializing ReservoirKit. Refer to our docs for steps on how to do this: http://docs.reservoir.tools'
        )
      }
    } else {
      this.source = options.source
    }
  }

  configure(options: ReservoirClientOptions) {
    this.source = options.source ? options.source : this.source
    this.apiKey = options.apiKey ? options.apiKey : this.apiKey
    this.uiVersion = options.uiVersion ? options.uiVersion : this.uiVersion
    this.apiBase = options.apiBase ? options.apiBase : this.apiBase
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
