import { paths, ReservoirSDK, setParams } from '@reservoir0x/reservoir-kit-core'
import { useEffect, useState } from 'react'

type TokenDetailsResponse =
  paths['/tokens/details/v4']['get']['responses']['200']['schema']

export default function (
  query?: paths['/tokens/details/v4']['get']['parameters']['query']
) {
  const [resp, setResp] = useState<TokenDetailsResponse | null>(null)

  useEffect(() => {
    if (query && ReservoirSDK.initialized) {
      const path = new URL(`${ReservoirSDK.client().apiBase}/tokens/details/v4`)
      setParams(path, query)
      fetch(path)
        .then((response) => response.json())
        .then((data) => setResp(data))
        .catch((err) => {
          console.error(err.message)
        })
    }
  }, [query])

  return resp
}
