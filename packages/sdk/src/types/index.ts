import { Address, CustomTransport, HttpTransport } from 'viem'
import { paths } from './api'
export * from './api'

export type BuyPath =
  paths['/execute/buy/v7']['post']['responses']['200']['schema']['path']
export type SellPath =
  paths['/execute/sell/v7']['post']['responses']['200']['schema']['path']
export type ExecuteFees =
  | paths['/execute/buy/v7']['post']['responses']['200']['schema']['fees']
  | paths['/execute/call/v1']['post']['responses']['200']['schema']['fees']
export type MintPath =
  paths['/execute/mint/v1']['post']['responses']['200']['schema']['path']

export type BuyResponses =
  paths['/execute/buy/v7']['post']['responses']['200']['schema']

export type MintResponses =
  paths['/execute/mint/v1']['post']['responses']['200']['schema']

export type SignatureStepItem = Pick<
  NonNullable<Execute['steps'][0]['items']>[0],
  'status' | 'orderIds' | 'orderIndexes' | 'orderData'
> & {
  data?: {
    sign?: {
      signatureKind: 'eip191' | 'eip712'
    } & {
      //Available if eip191
      domain: any
      types: any
      primaryType: string
      value?: any
    } & {
      //Available is eip712
      message: string
    }
    post?: {
      body: any
      method: string
      endpoint: string
    }
  }
}
export type TransactionStepItem = Pick<
  NonNullable<Execute['steps'][0]['items']>[0],
  'status' | 'orderIds' | 'orderIndexes' | 'orderData' | 'check'
> & {
  data: {
    data: any
    from: `0x${string}`
    to: `0x${string}`
    value: string
    maxFeePerGas?: string
    maxPriorityFeePerGas?: string
    gas?: string
  }
}

export type Execute = {
  requestId?: string
  errors?: { message?: string; orderId?: string }[]
  path: BuyPath | SellPath
  fees?: ExecuteFees
  error?: any // Manually added client error
  steps: {
    error?: string
    errorData?: any
    action: string
    description: string
    kind: 'transaction' | 'signature'
    id: string
    items?: {
      status: 'complete' | 'incomplete'
      data?: any
      check?: NonNullable<BuyResponses['steps']>['0']['items'][0]['check']
      orderIndexes?: number[]
      orderIds?: string[]
      // Manually added
      error?: string
      txHashes?: {
        txHash: Address
        chainId: number
      }[]
      internalTxHashes?: {
        txHash: Address
        chainId: number
      }[]
      errorData?: any
      orderData?: {
        crossPostingOrderId?: string
        orderId: string
        orderIndex: string
      }[]
      transfersData?: paths['/transfers/bulk/v2']['get']['responses']['200']['schema']['transfers']
      //
    }[]
  }[]
}

export type ReservoirWallet = {
  handleSignMessageStep: (
    item: SignatureStepItem,
    step: Execute['steps'][0]
  ) => Promise<string | undefined>
  handleSendTransactionStep: (
    chainId: number,
    item: TransactionStepItem,
    step: Execute['steps'][0]
  ) => Promise<`0x${string}` | undefined>
  address: () => Promise<string>
  transport?: CustomTransport | HttpTransport
}

export type ExpectedPrice = {
  amount?: number
  raw?: bigint
  currencyAddress?: string
  currencyDecimals?: number
}
