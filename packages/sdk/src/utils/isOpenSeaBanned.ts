import axios, { AxiosRequestHeaders } from 'axios'
import { getClient } from '../actions'
import { version } from '../../package.json'

/**
 * Check if a token is banned on OpenSea
 * @param contract Contract address of the NFT collection
 * @param tokenId Token ID to be checked
 * @returns `true` If the token is banned on OpenSea. `false` otherwise.
 */
export async function isOpenSeaBanned(
  collectionId: string,
  tokenId: number | string
) {
  const contract = collectionId ? collectionId?.split(':')[0] : undefined
  const base = 'https://api.opensea.io'
  const url = new URL(`/api/v1/asset/${contract}/${tokenId}`, base)

  const res = await axios.get(url.href)
  const json = res.data
  const client = getClient()
  const apiBase = client?.apiBase
  if (res.status === 200 && apiBase) {
    const apiKey = client?.apiKey
    const headers: AxiosRequestHeaders = {
      'Content-Type': 'application/json',
      'x-rkc-version': version,
    }
    const body = {
      token: `${contract}:${tokenId}`,
      flag: !json?.supports_wyvern ? 1 : 0,
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
  }

  return !json?.supports_wyvern
}
