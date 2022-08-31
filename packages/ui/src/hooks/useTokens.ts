import { paths, setParams } from '@reservoir0x/reservoir-kit-client'
import useReservoirClient from './useReservoirClient'
import useSWR, { SWRConfiguration } from 'swr'

type TokenDetailsResponse =
  paths['/tokens/v5']['get']['responses']['200']['schema']

export default function (
  query?: paths['/tokens/v5']['get']['parameters']['query'] | false,
  swrOptions: SWRConfiguration = {}
) {
  const client = useReservoirClient()

  const path = new URL(`${client?.apiBase}/tokens/v5`)
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
