import { ComponentPropsWithoutRef } from 'react'
import { SWRConfig } from 'swr'
import { version } from '../../package.json'

export const swrDefaultOptions: ComponentPropsWithoutRef<
  typeof SWRConfig
>['value'] = {
  fetcher: (resource, apiKey, clientVersion) => {
    const headers: HeadersInit = {
      'x-rkui-version': version,
    }
    if (apiKey) {
      headers['x-api-key'] = apiKey
    }
    if (clientVersion) {
      headers['x-rkc-version'] = clientVersion
    }
    return fetch(resource, {
      headers,
    })
      .then((res) => res.json())
      .catch((e) => {
        throw e
      })
  },
  revalidateOnFocus: false,
}
