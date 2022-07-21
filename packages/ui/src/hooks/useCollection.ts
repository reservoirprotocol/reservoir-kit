import { paths, setParams } from '@reservoir0x/reservoir-kit-core'
import { useEffect, useState } from 'react'
import useCoreSdk from './useCoreSdk'

type CollectionResponse =
  paths['/collection/v2']['get']['responses']['200']['schema']['collection']

export default function (
  query?: paths['/collection/v2']['get']['parameters']['query'] | false
) {
  const [resp, setResp] = useState<CollectionResponse | null>(null)
  const sdk = useCoreSdk()

  useEffect(() => {
    if (query) {
      const path = new URL(`${sdk?.apiBase}/collection/v2`)
      setParams(path, query)

      const options: RequestInit | undefined = {}
      if (sdk?.apiKey) {
        options.headers = {
          'x-api-key': sdk.apiKey,
        }
      }

      fetch(path, options)
        .then((response) => response.json())
        .then((data) =>
          setResp(data && data.collection ? data.collection : null)
        )
        .catch((err) => {
          console.error(err.message)
        })
    }
  }, [query])

  return resp
}
