import { axios } from '../utils'
import { AxiosRequestConfig, AxiosRequestHeaders } from 'axios'
import { version } from '../../package.json'
import { getClient } from '../'

export function request(config: AxiosRequestConfig = {}) {
  const client = getClient()
  const headers: AxiosRequestHeaders = {
    'Content-Type': 'application/json',
    'x-rkc-version': version,
  }
  if (client?.apiKey) {
    headers['x-api-key'] = client.apiKey
  }
  return axios.request({ headers: headers, ...config })
}

export function APIError(message: string) {
  return new Error(message, { cause: 'APIError' })
}

export function isAPIError(error?: Error) {
  return error && error.cause === 'APIError'
}
