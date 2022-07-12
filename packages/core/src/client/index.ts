import actions from './actions'
import * as utils from '../utils'

type NonUndefined<T> = T extends undefined ? never : T

type Fee = NonUndefined<
  NonNullable<
    Parameters<ReservoirSDKActions['listToken']>['0']['options']
  >['fee']
>
type FeeRecipient = NonUndefined<
  NonNullable<
    Parameters<ReservoirSDKActions['listToken']>['0']['options']
  >['feeRecipient']
>

export type ReservoirClientOptions = {
  apiBase: string
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

export type ReservoirSDKActions = typeof actions

export class ReservoirSDK {
  private static _client: ReservoirSDK

  apiBase: string
  fee?: Fee
  feeRecipient?: FeeRecipient
  automatedRoyalties?: boolean
  actions = actions
  utils = utils

  private constructor(options: ReservoirClientOptions) {
    this.apiBase = options.apiBase
    this.automatedRoyalties = options.automatedRoyalties
    this.fee = options.fee
    this.feeRecipient = options.feeRecipient
  }

  public static init(options: ReservoirClientOptions): ReservoirSDK {
    if (!ReservoirSDK._client) {
      ReservoirSDK._client = new ReservoirSDK(options)
    }

    return ReservoirSDK._client
  }

  public static configure(options: ReservoirClientOptions): ReservoirSDK {
    let client = ReservoirSDK._client
    if (!client) {
      client = ReservoirSDK.init(options)
    } else {
      client.apiBase = options.apiBase ? options.apiBase : client.apiBase
      client.fee = options.fee
      client.feeRecipient = options.feeRecipient
      client.automatedRoyalties = options.automatedRoyalties
    }

    return client
  }

  public static client(): ReservoirSDK {
    if (!ReservoirSDK._client) {
      throw 'No client available, please call init to create a client'
    }
    return ReservoirSDK._client
  }
}
