/**
 * Check if a token is banned on OpenSea
 * @param contract Contract address of the NFT collection
 * @param tokenId Token ID to be checked
 * @returns `true` If the token is banned on OpenSea. `false` otherwise.
 */
export async function isOpenSeaBanned(contract: string, tokenId: number) {
  const base = 'https://api.opensea.io'
  const url = new URL(`/api/v1/asset/${contract}/${tokenId}`, base)

  const response = await fetch(url.href)

  const json = await response.json()

  return !json?.supports_wyvern
}
