import actions from './actions'
import * as utils from './utils'

export type ReservoirClientOptions = {
  apiBase: string
}

export type ReservoirSDKActions = typeof actions

export class ReservoirSDK {
  private static _client: ReservoirSDK

  apiBase: string
  actions = actions
  utils = utils

  private constructor(options: ReservoirClientOptions) {
    this.apiBase = options.apiBase
  }

  public static init(options: ReservoirClientOptions): ReservoirSDK {
    if (!ReservoirSDK._client) {
      ReservoirSDK._client = new ReservoirSDK(options)
    }

    return ReservoirSDK._client
  }

  public static client(): ReservoirSDK {
    if (!ReservoirSDK._client) {
      throw 'No client available, please call init to create a client'
    }
    return ReservoirSDK._client
  }
}
