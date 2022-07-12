import { paths, setParams } from '@reservoir0x/reservoir-kit-core'
import { useEffect, useState } from 'react'
import useCoreSdk from './useCoreSdk'

type CollectionResponse =
  paths['/collection/v2']['get']['responses']['200']['schema']['collection']

export default function (
  query?: paths['/collection/v2']['get']['parameters']['query']
) {
  const [resp, setResp] = useState<CollectionResponse | null>(null)
  const sdk = useCoreSdk()

  useEffect(() => {
    if (query) {
      const path = new URL(`${sdk?.apiBase}/collection/v2`)
      setParams(path, query)
      fetch(path)
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
