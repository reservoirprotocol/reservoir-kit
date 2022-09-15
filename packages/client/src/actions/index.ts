import actions from './actions'
import * as utils from '../utils'
import { version } from '../../package.json'

type NonUndefined<T> = T extends undefined ? never : T

type Fee = NonUndefined<
  NonNullable<
    Parameters<ReservoirClientActions['listToken']>['0']['listings'][0]
  >['fee']
>
type FeeRecipient = NonUndefined<
  NonNullable<
    Parameters<ReservoirClientActions['listToken']>['0']['listings'][0]
  >['feeRecipient']
>

export type ReservoirClientOptions = {
  apiBase: string
  apiKey?: string
  uiVersion?: string
  source?: string
  automatedRoyalties?: boolean
} & (
  | {
      fee: Fee
      feeRecipient: FeeRecipient
    }
  | {
      fee?: undefined
      feeRecipient?: undefined
    }
)

export type ReservoirClientActions = typeof actions

let _client: ReservoirClient

export class ReservoirClient {
  version: string
  apiBase: string
  source?: string
  apiKey?: string
  uiVersion?: string
  fee?: Fee
  feeRecipient?: FeeRecipient
  automatedRoyalties?: boolean

  readonly utils = { ...utils }
  readonly actions: ReservoirClientActions = actions

  constructor(options: ReservoirClientOptions) {
    this.version = version
    this.apiKey = options.apiKey
    this.uiVersion = options.uiVersion
    this.apiBase = options.apiBase
    this.automatedRoyalties = options.automatedRoyalties
    this.fee = options.fee
    this.feeRecipient = options.feeRecipient

    if (!options.source) {
      if (typeof window !== 'undefined') {
        let host = location.hostname
        if (host.indexOf('www.') === 0) {
          host = host.replace('www.', '')
        }
        this.source = host
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
    this.fee = options.fee
    this.feeRecipient = options.feeRecipient
    this.automatedRoyalties = options.automatedRoyalties
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
