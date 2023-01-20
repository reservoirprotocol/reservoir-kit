import { ComponentPropsWithoutRef } from 'react'
import { SWRConfig } from 'swr'
import { version } from '../../package.json'

export const defaultHeaders = (
  apiKey?: string | null,
  clientVersion?: string | null
) => {
  const headers: HeadersInit = {
    'x-rkui-version': version,
  }
  if (apiKey) {
    headers['x-api-key'] = apiKey
  }
  if (clientVersion) {
    headers['x-rkc-version'] = clientVersion
  }
  return headers
}

export const defaultFetcher = (params: string[]) => {
  const resource = params[0]
  const apiKey = params[1]
  const clientVersion = params[2]
  const headers = defaultHeaders(apiKey, clientVersion)
  return fetch(resource, {
    headers,
  })
    .then((res) => res.json())
    .catch((e) => {
      throw e
    })
}

export const swrDefaultOptions: ComponentPropsWithoutRef<
  typeof SWRConfig
>['value'] = {
  fetcher: defaultFetcher,
  revalidateOnFocus: false,
}
