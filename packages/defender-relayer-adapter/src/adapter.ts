import { ApiRelayerParams } from '@openzeppelin/defender-relay-client'
import {
  DefenderRelayProvider,
  DefenderRelaySigner,
  DefenderRelaySignerOptions,
} from '@openzeppelin/defender-relay-client/lib/ethers'
import { ReservoirWallet } from '@reservoir0x/reservoir-sdk'
import { CustomTransport, HttpTransport } from 'viem'
import { adaptEthersSigner } from '@reservoir0x/ethers-wallet-adapter'

let _credentials: ApiRelayerParams = {
  apiKey: '',
  apiSecret: '',
}
let provider: DefenderRelayProvider
let signer: DefenderRelaySigner

export const adaptDefenderRelay = (
  credentials: ApiRelayerParams,
  options?: DefenderRelaySignerOptions,
  transport?: CustomTransport | HttpTransport
): ReservoirWallet => {
  if (
    credentials?.apiKey !== _credentials?.apiKey ||
    credentials?.apiSecret !== _credentials?.apiSecret
  ) {
    provider = new DefenderRelayProvider(credentials)
    signer = new DefenderRelaySigner(credentials, provider, options)
  }

  return adaptEthersSigner(signer, transport)
}
