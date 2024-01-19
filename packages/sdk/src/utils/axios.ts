import _axios, { AxiosResponse } from 'axios'
import { APIError } from './request'

export const axios = _axios.create()

//axios.interceptors.request.use((_req) => {})

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
    return Promise.reject(
      new APIError(
        error.response?.data?.message,
        error.response?.data?.statusCode || 500,
        error.response?.data
      )
    )
  }
)
