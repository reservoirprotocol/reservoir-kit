import { paths, setParams } from '@reservoir0x/reservoir-kit-client'
import useReservoirClient from './useReservoirClient'
import useSWR, { SWRConfiguration } from 'swr'

type Asks = paths['/orders/asks/v2']['get']['responses']['200']['schema']
type AsksQuery = paths['/orders/asks/v2']['get']['parameters']['query']

export default function (
  options: AsksQuery,
  swrOptions: SWRConfiguration = {}
) {
  const client = useReservoirClient()

  const url = new URL(`${client?.apiBase || ''}/orders/asks/v2`)
  let query: AsksQuery = options || {}
  setParams(url, query)
  const { data, mutate, error, isValidating } = useSWR<Asks>(
    [url.href, client?.apiKey],
    null,
    {
      revalidateOnMount: true,
      ...swrOptions,
    }
  )

  const listings = data && data.orders ? data.orders : null

  return { data, listings, mutate, error, isValidating }
}
