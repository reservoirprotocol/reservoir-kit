import { ComponentPropsWithoutRef } from 'react'
import { Cache, SWRConfig } from 'swr'
import { version } from '../../package.json'
import { axios } from '@reservoir0x/reservoir-sdk'

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
  return axios(resource, {
    headers,
  })
    .then((res) => {
      if (res.headers?.['deprecation'] === 'true') {
        console.warn(
          `Warning: API ${res.config.url} is deprecated. Stability and performance may be affected.`
        )
      }

      return JSON.parse(res.data)
    })
    .catch((e) => {
      throw e
    })
}

const CACHE_KEY = 'reservoirkit.swr.cache'
const CACHE_KEY_TTL = 'reservoirkit.swr.cache-TTL'

export const localStorageProvider = (): Cache<any> => {
  let map = new Map([])
  let cacheTTL: Record<string, number> = {}
  try {
    map =
      typeof window !== 'undefined'
        ? new Map(JSON.parse(localStorage.getItem(CACHE_KEY) || '[]'))
        : new Map([])
    cacheTTL =
      typeof window !== 'undefined'
        ? JSON.parse(localStorage.getItem(CACHE_KEY_TTL) || '{}')
        : {}
    for (let key in cacheTTL) {
      const ttl: number = cacheTTL[key]
      const response = map.get(key) as any
      let purge = false

      if (Date.now() >= ttl) {
        purge = true
      } else if (
        response.value &&
        response.data &&
        response.data.some((data: any) => !data)
      ) {
        purge = true
      }

      if (purge) {
        map.delete(key)
        delete cacheTTL[key]
      }
    }
  } catch (e) {
    console.warn('Failed to rehydrate SWR cache')
  }

  //Handlers to set TTL:
  const mapSet = map.set.bind(map)
  map.set = (key: unknown, value: unknown) => {
    const url = key as string
    const coingeckoCoinsApi = 'api.coingecko.com/api/v3/coins/list'
    if (url.includes(coingeckoCoinsApi)) {
      cacheTTL[url] = Date.now() + 7200000 //2hr
    } else {
      cacheTTL[url] = Date.now() + 60000 * 5 //5m
    }
    return mapSet(key, value)
  }

  // Before unloading the app, we write back all the data into `localStorage`.
  if (typeof window !== 'undefined') {
    //Allowlist of all domains or urls we want to cache locally
    window.addEventListener('beforeunload', () => {
      const cachedApis = ['api.coingecko.com', '/currencies/conversion/v']
      for (let url of map.keys()) {
        if (
          !cachedApis.some((cachedApi) => (url as string).includes(cachedApi))
        ) {
          map.delete(url)
        }
      }
      const appCache = JSON.stringify(Array.from(map.entries()))
      localStorage.setItem(CACHE_KEY_TTL, JSON.stringify(cacheTTL))
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
