import type { ReservoirWallet } from '@reservoir0x/reservoir-sdk'
import { GelatoRelay } from '@gelatonetwork/relay-sdk'
import type { Signer } from 'ethers/lib/ethers'
import { arrayify } from 'ethers/lib/utils'
import type { TypedDataSigner } from '@ethersproject/abstract-signer/lib/index'
import { getTaskStatus } from './utils'

// Returns a ReservoirWallet adapter that sends gasless transactions using Gelato
// Make sure the wallet has been switched to your desired network, before calling
// this function.
//
// - Developed by Privy in partnership with Reservoir
export const adaptGelatoRelayer = (
  signer: Signer,
  gelatoApiKey: string
): ReservoirWallet => {
  return {
    address: async () => {
      return signer.getAddress()
    },
    handleSignMessageStep: async (stepItem) => {
      const signData = stepItem.data?.sign
      let signature: string | undefined
      if (signData) {
        // Request user signature
        if (signData.signatureKind === 'eip191') {
          if (signData.message.match(/0x[0-9a-fA-F]{64}/)) {
            // If the message represents a hash, we need to convert it to raw bytes first
            signature = await signer.signMessage(arrayify(signData.message))
          } else {
            signature = await signer.signMessage(signData.message)
          }
        } else if (signData.signatureKind === 'eip712') {
          signature = await (
            signer as unknown as TypedDataSigner
          )._signTypedData(signData.domain, signData.types, signData.value)
        }
      }
      return signature
    },
    handleSendTransactionStep: async (chainId, stepItem) => {
      const { ...stepData } = stepItem.data
      const address = await signer.getAddress()

      const relay = new GelatoRelay()
      const request = {
        chainId: chainId as any,
        target: stepData.to,
        data: stepData.data,
        user: address,
      }

      try {
        const relayResponse = await relay.sponsoredCallERC2771(
          request,
          signer.provider as any,
          gelatoApiKey
        )
        const { taskId } = relayResponse
        const txHash = await getTaskStatus(taskId)
        return txHash
      } catch (error) {
        throw new Error(`Gelato sponsored call failed with error: ${error}`)
      }
    },
  }
}
