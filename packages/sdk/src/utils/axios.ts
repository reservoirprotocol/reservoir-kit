import _axios, { AxiosResponse } from 'axios'
import { APIError } from './request'

export const axios = _axios.create()

axios.interceptors.response.use(
  (_res: AxiosResponse) => {
    if (_res.headers['Deprecation'] === 'true') {
      console.warn(
        `Warning: API ${_res.config.url} is deprecated. Stability and performance may be affected.`
      )
    }

    return _res
  },
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error?.message

    const statusCode =
      error?.response?.data?.statusCode || error?.response?.status

    const requestUrl = error?.config?.url || error?.request?.responseURL

    return Promise.reject(
      new APIError(message, statusCode, error.response?.data, requestUrl)
    )
  }
)
