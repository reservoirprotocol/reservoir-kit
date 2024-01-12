import actions from './actions'
import * as utils from '../utils'
import { version } from '../../package.json'
import { LogLevel, log as logUtil } from '../utils/logger'
import { ReservoirEvent } from '../utils/events'
import { PaymentToken, chainPaymentTokensMap } from '../utils/paymentTokens'

export type ReservoirChain = {
  id: number
  name: string
  baseApiUrl: string
  active: boolean
  paymentTokens?: PaymentToken[]
  marketplaceFees?: string[]
  websocketUrl?: string
  checkPollingInterval?: number
}

export type ReservoirEventListener = (
  event: ReservoirEvent,
  chainId: number
) => void

/**
 * ReservoirClient Configuration Options
 * @param chains List of chain objects with configuration (id, name, baseApiUrl, paymentTokens and if it's the default)
 * @param source Used to manually override the source domain used to attribute local orders
 * @param automatedRoyalties If true, royalties will be automatically included, defaults to true. Only relevant for creating orders.
 * @param marketplaceFees A list of fee strings representing a recipient and the fee in BPS delimited by a colon: ["0xabc:100"] used when creating an order (listing or bid)
 * @param normalizeRoyalties Normalize orders that don't have royalties by apply royalties on top of them
 * @param bountyReferrer Referrer address to collect bounties when filling orders (applies to zora, manifold, etc)
 * @param logLevel Log level from 0-4, the higher the more verbose.
 * @param maxPollingAttemptsBeforeTimeout The maximum number of attempts the synced api is polled before timing out. The api is polled every 5 secs (default is 30)
 */
export type ReservoirClientOptions = {
  chains: ReservoirChain[]
  apiKey?: string
  uiVersion?: string
  source?: string
  automatedRoyalties?: boolean
  marketplaceFees?: string[]
  normalizeRoyalties?: boolean
  bountyReferrer?: string
  logLevel?: LogLevel
  maxPollingAttemptsBeforeTimeout?: number
}

export type ReservoirClientActions = typeof actions

let _client: ReservoirClient
let _eventListeners: ReservoirEventListener[] = []

export class ReservoirClient {
  version: string
  chains: ReservoirChain[]
  apiKey?: string
  source?: string
  uiVersion?: string
  marketplaceFees?: string[]
  automatedRoyalties?: boolean
  normalizeRoyalties?: boolean
  bountyReferrer?: string
  logLevel: LogLevel
  maxPollingAttemptsBeforeTimeout?: number
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
    this.chains = options.chains.map((chain) => ({
      ...chain,
      baseApiUrl: chain.baseApiUrl.replace(/\/$/, ''),
      paymentTokens: chain?.paymentTokens
        ? chain?.paymentTokens
        : chainPaymentTokensMap[chain.id],
    }))
    this.apiKey = options.apiKey
    this.uiVersion = options.uiVersion
    this.automatedRoyalties = options.automatedRoyalties
    this.marketplaceFees = options.marketplaceFees
    this.normalizeRoyalties = options.normalizeRoyalties
    this.source = options.source
    this.bountyReferrer = options.bountyReferrer
    this.logLevel =
      options.logLevel !== undefined ? options.logLevel : LogLevel.None
    this.maxPollingAttemptsBeforeTimeout =
      options.maxPollingAttemptsBeforeTimeout
  }

  configure(options: ReservoirClientOptions) {
    this.source = options.source ? options.source : this.source
    this.uiVersion = options.uiVersion ? options.uiVersion : this.uiVersion
    this.chains = options.chains
      ? options.chains.map((chain) => ({
          ...chain,
          baseApiUrl: chain.baseApiUrl.replace(/\/$/, ''),
          paymentTokens: chain?.paymentTokens
            ? chain?.paymentTokens
            : chainPaymentTokensMap[chain.id],
        }))
      : this.chains
    this.marketplaceFees = options.marketplaceFees
      ? options.marketplaceFees
      : this.marketplaceFees
    this.automatedRoyalties = options.automatedRoyalties
    this.normalizeRoyalties =
      options.normalizeRoyalties !== undefined
        ? options.normalizeRoyalties
        : this.normalizeRoyalties
    this.bountyReferrer =
      options.bountyReferrer !== undefined
        ? options.bountyReferrer
        : this.bountyReferrer
    this.logLevel =
      options.logLevel !== undefined ? options.logLevel : LogLevel.None
    this.maxPollingAttemptsBeforeTimeout =
      options.maxPollingAttemptsBeforeTimeout
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
      try {
        listener(event, chainId)
      } catch (e) {
        this.log(
          [`ReservoirClient: Listener error`, event, chainId, e],
          LogLevel.Verbose
        )
      }
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

export type { BuyTokenBodyParameters } from './buyToken'
