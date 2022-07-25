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
  steps: {
    message?: string
    error?: string
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
