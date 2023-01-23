import useSWR, { SWRConfiguration } from 'swr'

export type OpenSeaTokenResponse = {
  supports_wyvern?: boolean
  collection?: {
    payment_tokens: {
      address: string
      decimals: number
      name: string
      symbol: string
    }[]
  }
}

export default function (
  contract?: string,
  tokenId?: number | string,
  swrOptions: SWRConfiguration = {}
) {
  const path = new URL(
    `https://api.opensea.io/api/v1/asset/${contract}/${tokenId}`
  )

  const { data, mutate, error, isValidating } = useSWR<OpenSeaTokenResponse>(
    contract && tokenId ? [path.href] : null,
    (resource: string) => {
      return fetch(resource)
        .then((res) => res.json())
        .catch((e) => {
          throw e
        })
    },
    {
      revalidateOnMount: true,
      ...swrOptions,
    }
  )

  return { response: data, mutate, error, isValidating }
}
