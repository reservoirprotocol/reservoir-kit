import { ReservoirWallet, axios } from '@reservoir0x/reservoir-sdk'
import {
  ERC2771Type,
  GelatoRelay,
  RelayResponse,
} from '@gelatonetwork/relay-sdk'
import type { Signer } from 'ethers'
import { utils } from 'ethers'
import type { TypedDataSigner } from '@ethersproject/abstract-signer'
import { getTaskStatus } from './utils'

// Returns a ReservoirWallet adapter that sends gasless transactions using Gelato
// Make sure the wallet has been switched to your desired network, before calling
// this function.
//
// - Developed by Privy in partnership with Reservoir

// Two ways to use this. Can supply an API key from the front end or
// an API proxy URL to your backend where the API key lives.
export const adaptGelatoRelayer = (
  signer: Signer,
  gelatoApiKey?: string,
  gelatoProxyApiUrl?: string
): ReservoirWallet => {
  if (!gelatoApiKey && !gelatoProxyApiUrl) {
    throw new Error('You must supply either an apiKey or a proxy API url.')
  }

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
            signature = await signer.signMessage(
              utils.arrayify(signData.message)
            )
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
        let relayResponse: RelayResponse

        if (gelatoApiKey) {
          relayResponse = await relay.sponsoredCallERC2771(
            request,
            signer.provider as any,
            gelatoApiKey
          )
        } else if (gelatoProxyApiUrl) {
          const signatureData = await relay.getSignatureDataERC2771(
            request,
            signer.provider as any,
            ERC2771Type.SponsoredCall
          )
          // userNonce must be a number to be parsed into JSON
          const signatureDataFormatted = {
            ...signatureData,
            struct: {
              ...signatureData.struct,
              userNonce: Number(signatureData.struct.userNonce),
            },
          }
          const response = await axios(gelatoProxyApiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            data: JSON.stringify({ signatureData: signatureDataFormatted }),
          })
          relayResponse = JSON.parse(response.data)
        } else {
          throw new Error(
            'You must supply either an apiKey or a proxy API url.'
          )
        }
        const { taskId } = relayResponse
        const txHash = await getTaskStatus(taskId)
        return txHash
      } catch (error) {
        throw new Error(`Gelato sponsored call failed with error: ${error}`)
      }
    },
  }
}
