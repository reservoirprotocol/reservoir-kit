import { ReservoirWallet } from '../types/reservoirWallet'
import { LogLevel, getClient } from '../'
import { Account, WalletClient, hexToBigInt, toBytes } from 'viem'
import * as allChains from 'viem/chains'

export function isViemWalletClient(
  wallet: WalletClient | ReservoirWallet
): wallet is WalletClient {
  return (wallet as WalletClient).transport !== undefined
}

const adaptViemWallet = (wallet: WalletClient): ReservoirWallet => {
  return {
    address: async () => {
      let address = wallet.account?.address
      if (!address) {
        ;[address] = await wallet.getAddresses()
      }
      return address
    },
    signMessage: async (stepItem) => {
      const client = getClient()
      const signData = stepItem.data?.sign
      let signature: string | undefined
      if (signData) {
        if (signData.signatureKind === 'eip191') {
          client.log(['Execute Steps: Signing with eip191'], LogLevel.Verbose)
          if (signData.message.match(/0x[0-9a-fA-F]{64}/)) {
            // If the message represents a hash, we need to convert it to raw bytes first
            signature = await wallet.signMessage({
              account: wallet.account as Account,
              message: toBytes(signData.message).toString(),
            })
          } else {
            signature = await wallet.signMessage({
              account: wallet.account as Account,
              message: signData.message,
            })
          }
        } else if (signData.signatureKind === 'eip712') {
          client.log(['Execute Steps: Signing with eip712'], LogLevel.Verbose)
          signature = await wallet.signTypedData({
            account: wallet.account as Account,
            domain: signData.domain as any,
            types: signData.types as any,
            primaryType: signData.primaryType,
            message: signData.value,
          })
        }
      }
      return signature
    },
    sendTransaction: async (chainId, stepItem) => {
      const viemChain =
        Object.values(allChains).find((chain) => chain.id === (chainId || 1)) ||
        allChains.mainnet

      return await wallet.sendTransaction({
        chain: viemChain,
        data: stepItem.data,
        account: wallet.account ?? stepItem.from, // use signer.account if it's defined
        to: stepItem.to,
        value: hexToBigInt((stepItem.value as any) || 0),
        ...(stepItem.maxFeePerGas && {
          maxFeePerGas: hexToBigInt(stepItem.maxFeePerGas as any),
        }),
        ...(stepItem.maxPriorityFeePerGas && {
          maxPriorityFeePerGas: hexToBigInt(
            stepItem.maxPriorityFeePerGas as any
          ),
        }),
      })
    },
  }
}

export default adaptViemWallet
