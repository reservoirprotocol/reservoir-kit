import { paths } from './api'
export * from './api'

export type Execute = {
  quote?: number
  steps?:
    | {
        action: string
        description: string
        status: 'complete' | 'incomplete'
        message?: string
        error?: string
        kind: 'transaction' | 'signature' | 'request' | 'confirmation'
        data?: any
        txHash?: string
      }[]
  query?: { [key: string]: any }
  statusCode?: number
  error?: string
  message?: string
  txHash?: string
}

export type BatchExecute = {
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
    kind: 'transaction' | 'signature' | 'request' | 'confirmation'
    items?: {
      status: 'complete' | 'incomplete'
      data?: any
      txHash?: string
      orderId?: string
    }[]
  }[]
}
