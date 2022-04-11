export * from './api'

export type Execute = {
  steps?:
    | {
        action: string
        description: string
        status: 'complete' | 'incomplete'
        message?: string
        error?: string
        kind: 'transaction' | 'signature' | 'request' | 'confirmation'
        data?: any
      }[]
  query?: { [key: string]: any }
  statusCode?: number
  error?: string
  message?: string
}
