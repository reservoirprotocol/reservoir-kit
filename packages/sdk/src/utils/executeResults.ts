import { AxiosRequestConfig, AxiosRequestHeaders } from 'axios'
import { axios } from './axios'
import { getClient } from '../actions/index'
import { version } from '../../package.json'
import { paths } from '../types'
import { LogLevel } from './logger'

type ResultData = {
  request: AxiosRequestConfig
  stepId: string
  error?: any
  requestId?: string
  txHash?: string
}

export function executeResults(data: ResultData) {
  const client = getClient()
  const { request, stepId, error, requestId, txHash } = data

  if (!requestId) {
    client.log(
      ['Execute Results: skipping reporting results, missing requestId'],
      LogLevel.Verbose
    )
    return null
  }

  const headers = {
    'x-rkc-version': version,
  } as any as AxiosRequestHeaders

  if (request.headers && request.headers['x-api-key']) {
    headers['x-api-key'] = request.headers['x-api-key']
  }

  if (request.headers && client?.uiVersion) {
    request.headers['x-rkui-version'] = client.uiVersion
  }

  const params: paths['/execute/results/v1']['post']['parameters']['body']['body'] =
    {
      requestId,
      txHash,
      stepId,
    }

  if (error && error.message) {
    params.errorMessage = error.message as string
  } else if (error) {
    try {
      params.errorMessage = JSON.stringify(error)
    } catch (e) {
      params.errorMessage = 'Unknown error'
    }
  }

  client.log(['Execute Results: posting results', params], LogLevel.Verbose)
  return axios
    .post(`${request.baseURL}/execute/results/v1`, params, { headers })
    .catch((e) => {
      client.log(
        ['Execute Results: failed to post results', e],
        LogLevel.Verbose
      )
    })
}
