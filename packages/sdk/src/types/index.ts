import { paths } from './api'
export * from './api'

export type Execute = {
  errors?: { message?: string; orderId?: string }[]
  path:
    | paths['/execute/buy/v7']['post']['responses']['200']['schema']['path']
    | paths['/execute/sell/v7']['post']['responses']['200']['schema']['path']
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
      //
    }[]
  }[]
}
