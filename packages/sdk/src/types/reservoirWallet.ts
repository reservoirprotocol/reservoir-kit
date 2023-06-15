import { SignatureStepItem, TransactionStepItem } from './'

export type ReservoirWallet = {
  signMessage: (item: SignatureStepItem) => Promise<string | undefined>
  sendTransaction: (
    chainId: number,
    item: TransactionStepItem
  ) => Promise<`0x${string}` | undefined>
  address: () => Promise<string>
}
