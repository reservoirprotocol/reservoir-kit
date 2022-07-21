import axios from 'axios'

/**
 * Check if a token is banned on OpenSea
 * @param contract Contract address of the NFT collection
 * @param tokenId Token ID to be checked
 * @returns `true` If the token is banned on OpenSea. `false` otherwise.
 */
export async function isOpenSeaBanned(
  contract: string,
  tokenId: number | string
) {
  const base = 'https://api.opensea.io'
  const url = new URL(`/api/v1/asset/${contract}/${tokenId}`, base)

  async function getData() {
    let res = await axios.get(url.href)

    return res.data
  }

  const json = await getData()

  return !json?.supports_wyvern
}
