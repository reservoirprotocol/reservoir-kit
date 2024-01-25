import { axios } from '@reservoir0x/reservoir-sdk'

const gatewayConfig = {
  'ipfs://': 'https://ipfs.io/ipfs/',
  'ar://': 'https://arweave.net/',
}

const convertToGatewayUrl = (url: string) => {
  for (const [protocol, gateway] of Object.entries(gatewayConfig)) {
    if (url.includes(protocol)) {
      return url.replace(protocol, gateway)
    }
  }
  return url
}

const fetchUri = async (uri: string) => {
  const response = await axios(convertToGatewayUrl(uri), {
    method: 'GET',
  })

  if (!(response.status >= 200 && response.status < 300)) {
    throw new Error('Failed to fetch URI')
  }

  return response.data
}

export const convertTokenUriToImage = async (uri: string): Promise<string> => {
  try {
    const json = await fetchUri(uri)

    if (json.image) {
      const image = convertToGatewayUrl(json.image)
      return image
    }

    return ''
  } catch (e) {
    console.error(e)
    return ''
  }
}
