import axios, { AxiosResponse } from 'axios'

axios.interceptors.response.use((_res: AxiosResponse) => {
  if (_res.headers['Deprecation'] === 'true') {
    console.warn(
      `Warning: API ${_res.config.url} is deprecated. Stability and performance may be affected.`
    )
  }
  return _res
})
export * from 'axios'
export { default } from 'axios'
