import { paths, setParams } from '@reservoir0x/reservoir-kit-core'
import { useEffect, useState } from 'react'
import useCoreSdk from './useCoreSdk'

type SalesResponse = paths['/sales/v3']['get']['responses']['200']['schema']

export default function (
  query?: paths['/sales/v3']['get']['parameters']['query'] | false
) {
  const [resp, setResp] = useState<SalesResponse | null>(null)
  const sdk = useCoreSdk()

  useEffect(() => {
    if (query) {
      const path = new URL(`${sdk?.apiBase}/sales/v3`)
      setParams(path, query)
      fetch(path)
        .then((response) => response.json())
        .then((data) =>
          setResp(data && data.sales && data.sales.length > 0 ? data : null)
        )
        .catch((err) => {
          console.error(err.message)
        })
    }
  }, [query])

  return resp
}
