import { ComponentPropsWithoutRef } from 'react'
import { Cache, SWRConfig } from 'swr'
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
    .then((res) => {
      if (res.headers.get('deprecation') === 'true') {
        console.warn(
          `Warning: API ${res.url} is deprecated. Stability and performance may be affected.`
        )
      }

      return res.json()
    })
    .catch((e) => {
      throw e
    })
}

const CACHE_KEY = 'reservoirkit.swr.cache'

export const localStorageProvider = (): Cache<any> => {
  const map =
    typeof window !== 'undefined'
      ? new Map(JSON.parse(localStorage.getItem(CACHE_KEY) || '[]'))
      : new Map([])

  // Before unloading the app, we write back all the data into `localStorage`.
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      for (let url of map.keys()) {
        if (!(url as string).includes('api.coingecko.com')) {
          map.delete(url)
        }
      }
      const appCache = JSON.stringify(Array.from(map.entries()))
      localStorage.setItem(CACHE_KEY, appCache)
    })
  }

  // We still use the map for write & read for performance.
  return map as Cache<any>
}

export const swrDefaultOptions: ComponentPropsWithoutRef<
  typeof SWRConfig
>['value'] = {
  fetcher: defaultFetcher,
  revalidateOnFocus: false,
  provider: localStorageProvider,
}
