import { paths, ReservoirSDK, setParams } from '@reservoir0x/client-sdk'
import { useEffect, useState } from 'react'
// import fetcher from 'lib/fetcher'
// import setParams from 'lib/params'
// import useSWR from 'swr'

type tokenDetailsResponse =
  paths['/tokens/details/v4']['get']['responses']['200']['schema']

export const useTokenDetails = function (
  query: paths['/tokens/details/v4']['get']['parameters']['query']
) {
  const [resp, setResp] = useState<tokenDetailsResponse | null>(null)

  useEffect(() => {
    const path = new URL(`${ReservoirSDK.client().apiBase}/tokens/details/v4`)
    setParams(path, query)
    fetch(path)
      .then((response) => response.json())
      .then((data) => setResp(data))
      .catch((err) => {
        console.log(err.message)
      })
  }, [])

  return resp
}
