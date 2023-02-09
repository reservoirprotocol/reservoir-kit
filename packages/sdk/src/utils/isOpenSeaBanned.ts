import axios, { AxiosRequestHeaders } from 'axios'
import { getClient } from '../actions'
import { version } from '../../package.json'

/**
 * Check if tokens are banned on OpenSea
 * @param tokens An array of token ids (e.g. ["123:0xabc123"])
 * @returns `{tokenId: true}` A dictionary of token banned status from OpenSea.
 */
export async function isOpenSeaBanned(ids: string[]) {
  let url = 'https://api.opensea.io/api/v1/assets'
  ids.forEach((id, i) => {
    const [contract, tokenId] = id.split(':')
    const prefix = i === 0 ? '?' : '&'
    url = `${url}${prefix}token_ids=${tokenId}&asset_contract_addresses=${contract}`
  })

  const res = await axios.get(url)
  const json = res.data
  const client = getClient()
  const apiBase = client?.apiBase
  const statuses: Record<string, boolean> = json.assets.reduce(
    (statuses: Record<string, boolean>, asset: any) => {
      statuses[`${asset.asset_contract.address}:${asset.token_id}`] =
        !asset.supports_wyvern
      return statuses
    },
    {} as Record<string, boolean>
  )
  if (res.status === 200 && apiBase) {
    const apiKey = client?.apiKey
    const headers: AxiosRequestHeaders = {
      'Content-Type': 'application/json',
      'x-rkc-version': version,
    }
    Object.keys(statuses).forEach((token) => {
      const status = statuses[token]
      const body = {
        token,
        flag: status ? 1 : 0,
      }

      if (apiKey) {
        headers['x-api-key'] = apiKey
      }
      if (client?.uiVersion) {
        headers['x-rkui-version'] = client.uiVersion
      }
      axios
        .post(`${apiBase}/tokens/flag/v1`, JSON.stringify(body), {
          headers,
        })
        .catch(() => {})
    })
  }

  return statuses
}
