const gatewayConfig = {
  'ipfs://': 'https://ipfs.io/ipfs/',
  'ar://': 'https://arweave.net/',
}

const convertToGatewayUrl = (url: string) => {
  for (const [protocol, gateway] of Object.entries(gatewayConfig)) {
    if (url.includes(protocol)) {
      console.log('replacing ', protocol, gateway)
      return url.replace(protocol, gateway)
    }
  }
  return url
}

const fetchUri = async (uri: string) => {
  console.log('uri: ', uri)
  const response = await fetch(convertToGatewayUrl(uri), {
    method: 'GET',
  })

  if (!response.ok) {
    throw new Error('Failed to fetch URI')
  }

  return response.json()
}

export const convertTokenUriToImage = async (uri: string): Promise<string> => {
  try {
    const json = await fetchUri(uri)

    console.log('json: ', json)

    if (json.image) {
      const image = convertToGatewayUrl(json.image)
      console.log('image: ', image)
      return image
    }

    return ''
  } catch (e) {
    console.error(e)
    return ''
  }
}
