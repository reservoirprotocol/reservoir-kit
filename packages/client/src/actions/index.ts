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

export class ReservoirClient {
  private static _client: ReservoirClient

  apiBase: string
  apiKey?: string
  fee?: Fee
  feeRecipient?: FeeRecipient
  automatedRoyalties?: boolean
  actions = actions
  utils = utils

  private constructor(options: ReservoirClientOptions) {
    this.apiKey = options.apiKey
    this.apiBase = options.apiBase
    this.automatedRoyalties = options.automatedRoyalties
    this.fee = options.fee
    this.feeRecipient = options.feeRecipient
  }

  public static init(options: ReservoirClientOptions): ReservoirClient {
    if (!ReservoirClient._client) {
      ReservoirClient._client = new ReservoirClient(options)
    }

    return ReservoirClient._client
  }

  public static configure(options: ReservoirClientOptions): ReservoirClient {
    let client = ReservoirClient._client
    if (!client) {
      client = ReservoirClient.init(options)
    } else {
      client.apiKey = options.apiKey ? options.apiKey : client.apiKey
      client.apiBase = options.apiBase ? options.apiBase : client.apiBase
      client.fee = options.fee
      client.feeRecipient = options.feeRecipient
      client.automatedRoyalties = options.automatedRoyalties
    }

    return client
  }

  public static get(): ReservoirClient {
    if (!ReservoirClient._client) {
      throw 'No client available, please call init to create a client'
    }
    return ReservoirClient._client
  }
}
