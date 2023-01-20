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

export const defaultFetcher = (params: string[] | string) => {
  let resource
  let apiKey
  let clientVersion
  if (Array.isArray(params)) {
    resource = params[0]
    apiKey = params[1]
    clientVersion = params[2]
  } else {
    resource = params
  }
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
