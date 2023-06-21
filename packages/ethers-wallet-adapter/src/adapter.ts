import {
  LogLevel,
  ReservoirWallet,
  getClient,
} from '@reservoir0x/reservoir-sdk'
import { Signer } from 'ethers/lib/ethers'
import { arrayify } from 'ethers/lib/utils'
import { TypedDataSigner } from '@ethersproject/abstract-signer/lib/index'

export const adaptEthersSigner = (signer: Signer): ReservoirWallet => {
  return {
    address: async () => {
      return signer.getAddress()
    },
    handleSignMessageStep: async (stepItem) => {
      const client = getClient()
      const signData = stepItem.data?.sign
      let signature: string | undefined
      if (signData) {
        // Request user signature
        if (signData.signatureKind === 'eip191') {
          client.log(['Execute Steps: Signing with eip191'], LogLevel.Verbose)
          if (signData.message.match(/0x[0-9a-fA-F]{64}/)) {
            // If the message represents a hash, we need to convert it to raw bytes first
            signature = await signer.signMessage(arrayify(signData.message))
          } else {
            signature = await signer.signMessage(signData.message)
          }
        } else if (signData.signatureKind === 'eip712') {
          client.log(['Execute Steps: Signing with eip712'], LogLevel.Verbose)
          signature = await (
            signer as unknown as TypedDataSigner
          )._signTypedData(signData.domain, signData.types, signData.value)
        }
      }
      return signature
    },
    handleSendTransactionStep: async (chainId, stepItem) => {
      const transaction = await signer.sendTransaction(stepItem.data)
      return transaction.hash as `0x${string}`
    },
  }
}
