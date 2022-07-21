import { paths, setParams } from '@reservoir0x/reservoir-kit-client'
import { useEffect, useState } from 'react'
import useReservoirClient from './useReservoirClient'

type CollectionResponse =
  paths['/collection/v2']['get']['responses']['200']['schema']['collection']

export default function (
  query?: paths['/collection/v2']['get']['parameters']['query'] | false
) {
  const [resp, setResp] = useState<CollectionResponse | null>(null)
  const client = useReservoirClient()

  useEffect(() => {
    if (query) {
      const path = new URL(`${client?.apiBase}/collection/v2`)
      setParams(path, query)

      const options: RequestInit | undefined = {}
      if (client?.apiKey) {
        options.headers = {
          'x-api-key': client.apiKey,
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
