import actions from './actions'
import * as utils from '../utils'

type NonUndefined<T> = T extends undefined ? never : T

type Fee = NonUndefined<
  NonNullable<
    Parameters<ReservoirClientActions['listToken']>['0']['options']
  >['fee']
>
type FeeRecipient = NonUndefined<
  NonNullable<
    Parameters<ReservoirClientActions['listToken']>['0']['options']
  >['feeRecipient']
>

export type ReservoirClientOptions = {
  apiBase: string
  apiKey?: string
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
  apiBase: string
  apiKey?: string
  fee?: Fee
  feeRecipient?: FeeRecipient
  automatedRoyalties?: boolean
  readonly actions = actions
  readonly utils = utils

  constructor(options: ReservoirClientOptions) {
    this.apiKey = options.apiKey
    this.apiBase = options.apiBase
    this.automatedRoyalties = options.automatedRoyalties
    this.fee = options.fee
    this.feeRecipient = options.feeRecipient
  }

  configure(options: ReservoirClientOptions) {
    this.apiKey = options.apiKey ? options.apiKey : this.apiKey
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
