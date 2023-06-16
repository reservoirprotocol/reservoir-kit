import { paths } from './api'
export * from './api'

export type BuyPath =
  paths['/execute/buy/v7']['post']['responses']['200']['schema']['path']
export type SellPath =
  paths['/execute/sell/v7']['post']['responses']['200']['schema']['path']

export type Preview =
  paths['/execute/buy/v7']['post']['responses']['200']['schema']['preview']

export type Execute = {
  errors?: { message?: string; orderId?: string }[]
  preview?: Preview
  path: BuyPath | SellPath
  error?: string // Manually added client error
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
      orderIndexes?: number[]
      orderIds?: string[]
      // Manually added
      error?: string
      txHash?: string
      orderData?: {
        crossPostingOrderId?: string
        orderId: string
        orderIndex: string
      }[]
      transfersData?: paths['/transfers/bulk/v1']['get']['responses']['200']['schema']['transfers']
      //
    }[]
  }[]
}
