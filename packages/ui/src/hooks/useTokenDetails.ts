import { paths, setParams } from '@reservoir0x/reservoir-kit-core'
import useCoreSdk from './useCoreSdk'
import { useEffect, useState } from 'react'

type TokenDetailsResponse =
  paths['/tokens/details/v4']['get']['responses']['200']['schema']

export default function (
  query?: paths['/tokens/details/v4']['get']['parameters']['query'] | false
) {
  const [resp, setResp] = useState<TokenDetailsResponse | null>(null)
  const sdk = useCoreSdk()

  useEffect(() => {
    if (query) {
      const options: RequestInit | undefined = {}
      if (sdk?.apiKey) {
        options.headers = {
          'x-api-key': sdk.apiKey,
        }
      }

      const path = new URL(`${sdk?.apiBase}/tokens/details/v4`)
      setParams(path, query)
      fetch(path, options)
        .then((response) => response.json())
        .then((data) => setResp(data))
        .catch((err) => {
          console.error(err.message)
        })
    }
  }, [query])

  return resp
}
