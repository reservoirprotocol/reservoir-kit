import actions from './actions'
import * as utils from '../utils'
import { version } from '../../package.json'
import { LogLevel, log as logUtil } from '../utils/logger'
import { ReservoirEvent } from '../utils/events'

export type ReservoirChain = {
  id: number
  baseApiUrl: string
  active: boolean
  apiKey?: string
}

export type ReservoirEventListener = (
  event: ReservoirEvent,
  chainId: number
) => void

/**
 * ReservoirClient Configuration Options
 * @param chains List of chain objects with configuration (id, baseApiUrl, apiKey and if it's the default)
 * @param source Used to manually override the source domain used to attribute local orders
 * @param automatedRoyalties If true, royalties will be automatically included, defaults to true. Only relevant for creating orders.
 * @param marketplaceFees A list of fee strings representing a recipient and the fee in BPS delimited by a colon: ["0xabc:100"] used when creating an order (listing or bid)
 * @param normalizeRoyalties Normalize orders that don't have royalties by apply royalties on top of them
 */
export type ReservoirClientOptions = {
  chains: ReservoirChain[]
  uiVersion?: string
  source?: string
  automatedRoyalties?: boolean
  marketplaceFees?: string[]
  normalizeRoyalties?: boolean
  logLevel?: LogLevel
}

export type ReservoirClientActions = typeof actions

let _client: ReservoirClient
let _eventListeners: ReservoirEventListener[] = []

export class ReservoirClient {
  version: string
  chains: ReservoirChain[]
  source?: string
  uiVersion?: string
  marketplaceFees?: string[]
  automatedRoyalties?: boolean
  normalizeRoyalties?: boolean
  logLevel: LogLevel
  log(
    message: Parameters<typeof logUtil>['0'],
    level: LogLevel = LogLevel.Info
  ) {
    return logUtil(message, level, this.logLevel)
  }

  readonly utils = { ...utils }
  readonly actions: ReservoirClientActions = actions

  constructor(options: ReservoirClientOptions) {
    this.version = version
    this.chains = options.chains
    this.uiVersion = options.uiVersion
    this.automatedRoyalties = options.automatedRoyalties
    this.marketplaceFees = options.marketplaceFees
    this.normalizeRoyalties = options.normalizeRoyalties
    this.source = options.source
    this.logLevel =
      options.logLevel !== undefined ? options.logLevel : LogLevel.None
  }

  configure(options: ReservoirClientOptions) {
    this.source = options.source ? options.source : this.source
    this.uiVersion = options.uiVersion ? options.uiVersion : this.uiVersion
    this.chains = options.chains ? options.chains : this.chains
    this.marketplaceFees = options.marketplaceFees
      ? options.marketplaceFees
      : this.marketplaceFees
    this.automatedRoyalties = options.automatedRoyalties
    this.normalizeRoyalties =
      options.normalizeRoyalties !== undefined
        ? options.normalizeRoyalties
        : this.normalizeRoyalties
    this.logLevel =
      options.logLevel !== undefined ? options.logLevel : LogLevel.None
  }

  currentChain() {
    if (this.chains && this.chains.length > 0) {
      const defaultChain = this.chains.find((chain) => chain.active)
      if (defaultChain) {
        return defaultChain
      }
      return this.chains[0]
    }
    return null
  }

  /**
   * Add an Event Listener
   * @param listener A function to callback whenever an event is emitted
   */
  addEventListener(listener: ReservoirEventListener) {
    _eventListeners.push(listener)
  }

  /**
   * Remove an Event Listener
   * @param listener The listener function to remove
   */
  removeEventListener(listener: ReservoirEventListener) {
    _eventListeners = _eventListeners.filter((item) => listener !== item)
  }

  /**
   * Remove all Event Listeners
   */
  clearEventListeners() {
    _eventListeners = []
  }

  /**
   * Internal method to send events to listeners, not to be used directly
   * @param listener A function to callback whenever an event is emitted
   */
  _sendEvent(event: ReservoirEvent, chainId: number) {
    this.log(
      [
        `ReservoirClient: Sending Event to ${_eventListeners.length} listeners`,
        event,
        chainId,
      ],
      LogLevel.Verbose
    )
    _eventListeners.forEach((listener) => {
      listener(event, chainId)
    })
  }
}

export function getClient() {
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
