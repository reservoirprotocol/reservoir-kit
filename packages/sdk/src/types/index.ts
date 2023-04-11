import { paths } from './api'
export * from './api'

export type Execute = {
  error?: string
  path:
    | paths['/execute/buy/v7']['post']['responses']['200']['schema']['path']
    | paths['/execute/sell/v7']['post']['responses']['200']['schema']['path']
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
      // manually added
      error?: string
      txHash?: string
      orderData?: {
        crossPostingOrderId?: string
        orderId: string
        orderIndex: string
      }[]
    }[]
  }[]
  tokensExecuted?: string[]
}
