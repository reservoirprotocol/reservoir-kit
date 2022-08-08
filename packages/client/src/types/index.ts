import { paths } from './api'
export * from './api'

export type Execute = {
  error?: string
  path:
    | paths['/execute/buy/v3']['get']['responses']['200']['schema']['path']
    | paths['/execute/sell/v3']['get']['responses']['200']['schema']['path']
  steps: {
    message?: string
    error?: string
    errorData?: any
    action: string
    description: string
    kind: 'transaction' | 'signature'
    items?: {
      status: 'complete' | 'incomplete'
      data?: any
      txHash?: string
      orderId?: string
      orderIndex?: number
    }[]
  }[]
}
