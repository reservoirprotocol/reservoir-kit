import { axios } from '../utils'
import { AxiosRequestConfig, AxiosRequestHeaders } from 'axios'
import { version } from '../../package.json'
import { getClient } from '../'

export function request(config: AxiosRequestConfig = {}) {
  const client = getClient()
  const currentReservoirChain = client.currentChain()
  const headers: AxiosRequestHeaders = {
    'Content-Type': 'application/json',
    'x-rkc-version': version,
  }
  if (currentReservoirChain?.apiKey) {
    headers['x-api-key'] = currentReservoirChain.apiKey
  }
  return axios.request({ headers: headers, ...config })
}
