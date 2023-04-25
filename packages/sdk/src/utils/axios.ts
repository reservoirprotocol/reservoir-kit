import _axios, { AxiosResponse } from 'axios'

_axios.interceptors.response.use((_res: AxiosResponse) => {
  if (_res.headers['Deprecation'] === 'true') {
    console.warn(
      `Warning: API ${_res.config.url} is deprecated. Stability and performance may be affected.`
    )
  }
  return _res
})

export const axios = _axios
