import {
  LogLevel,
  ReservoirWallet,
  getClient,
} from '@reservoir0x/reservoir-sdk'
import { Signer } from 'ethers/lib/ethers'
import { arrayify } from 'ethers/lib/utils'
import { TypedDataSigner } from '@ethersproject/abstract-signer/lib/index'
import { CustomTransport, HttpTransport, hexToBigInt } from 'viem'

export const adaptEthersSigner = (
  signer: Signer,
  transport?: CustomTransport | HttpTransport
): ReservoirWallet => {
  return {
    transport,
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
      const stepData = stepItem.data
      const transaction = await signer.sendTransaction({
        data: stepData.data,
        to: stepData.to,
        from: stepData.from,
        value: hexToBigInt((stepData.value as any) || 0),
        ...(stepData.maxFeePerGas && {
          maxFeePerGas: hexToBigInt(stepData.maxFeePerGas as any),
        }),
        ...(stepData.maxPriorityFeePerGas && {
          maxPriorityFeePerGas: hexToBigInt(
            stepData.maxPriorityFeePerGas as any
          ),
        }),
        ...(stepData.gas && {
          gasLimit: hexToBigInt(stepData.gas as any),
        }),
      })

      return transaction.hash as `0x${string}`
    },
  }
}
