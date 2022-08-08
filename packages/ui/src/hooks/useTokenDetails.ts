import { paths, setParams } from '@reservoir0x/reservoir-kit-client'
import useReservoirClient from './useReservoirClient'
import useSWR, { SWRConfiguration } from 'swr'

type TokenDetailsResponse =
  paths['/tokens/details/v4']['get']['responses']['200']['schema']

export default function (
  query?: paths['/tokens/details/v4']['get']['parameters']['query'] | false,
  swrOptions: SWRConfiguration = {}
) {
  const client = useReservoirClient()

  const path = new URL(`${client?.apiBase}/tokens/details/v4`)
  setParams(path, query || {})

  const { data, mutate, error, isValidating } = useSWR<TokenDetailsResponse>(
    query ? [path.href, client?.apiKey] : null,
    null,
    {
      revalidateOnMount: true,
      ...swrOptions,
    }
  )

  const tokens = data && data?.tokens ? data.tokens : null

  return { response: data, data: tokens, mutate, error, isValidating }
}
