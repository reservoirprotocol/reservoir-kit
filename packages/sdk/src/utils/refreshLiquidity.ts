import { paths } from '../types/api'
import { request } from '../utils/request'

const refreshLiquidity = (baseApiUrl: string, token: string) => {
  const data: paths['/tokens/refresh/v1']['post']['parameters']['body']['body'] =
    {
      token,
      liquidityOnly: true,
    }
  request({
    method: 'POST',
    url: `${baseApiUrl}/tokens/refresh/v1`,
    data: JSON.stringify(data),
  }).catch(() => {})
}

export default refreshLiquidity
