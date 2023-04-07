import { AxiosRequestConfig } from 'axios'
import { Execute } from '../types/index'

export type ReservoirEventName =
  | 'purchase_error'
  | 'purchase_complete'
  | 'accept_offer_error'
  | 'accept_offer_complete'
  | 'offer_error'
  | 'offer_complete'
  | 'list_error'
  | 'list_complete'
  | 'unknown'

export type ReservoirEvent = {
  name: ReservoirEventName
  data: any
}

export const generateEvent = (
  request: AxiosRequestConfig,
  data?: Execute
): ReservoirEvent => {
  const isBuy = request.url?.includes('/execute/buy')
  const isSell = request.url?.includes('/execute/sell')
  const isBid = request.url?.includes('/execute/bid')
  const isList = request.url?.includes('/execute/list')
  let name: ReservoirEventName | undefined
  const hasError = data?.error || data?.steps.some((step) => step.error)

  if (isBuy) {
    name = hasError ? 'purchase_error' : 'purchase_complete'
  } else if (isSell) {
    name = hasError ? 'accept_offer_error' : 'accept_offer_complete'
  } else if (isBid) {
    name = hasError ? 'offer_error' : 'offer_complete'
  } else if (isList) {
    name = hasError ? 'list_error' : 'list_complete'
  } else {
    name = 'unknown'
  }

  return {
    name,
    data,
  }
}
