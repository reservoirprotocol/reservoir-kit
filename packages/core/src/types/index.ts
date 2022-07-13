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
