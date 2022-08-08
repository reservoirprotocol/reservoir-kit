import { ComponentPropsWithoutRef } from 'react'
import { SWRConfig } from 'swr'

export const swrDefaultOptions: ComponentPropsWithoutRef<
  typeof SWRConfig
>['value'] = {
  fetcher: (resource, apiKey) => {
    if (resource) {
      if (apiKey) {
        const config = {
          headers: {
            'x-api-key': apiKey,
          },
        }

        return fetch(resource, config)
          .then((res) => res.json())
          .catch((e) => {
            throw e
          })
      }
    }
    return fetch(resource)
      .then((res) => res.json())
      .catch((e) => {
        throw e
      })
  },
  revalidateOnFocus: false,
}
