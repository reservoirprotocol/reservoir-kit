import React, {
  createContext,
  FC,
  ReactNode,
  useEffect,
  useState,
  useRef,
  ComponentPropsWithoutRef,
  useCallback,
} from 'react'
import { ReservoirClientOptions } from '@reservoir0x/reservoir-sdk'
import { ReservoirKitTheme, darkTheme } from './themes'
import { ReservoirClientProvider } from './ReservoirClientProvider'
import { SWRConfig } from 'swr'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'

export type CoinId = {
  [key: string]: string
}
export type CoinGecko = {
  proxy?: string
  apiKey?: string
  coinIds?: CoinId
}

type ReservoirKitProviderOptions = {
  disablePoweredByReservoir?: boolean
  coinGecko?: CoinGecko
}
export interface ReservoirKitProviderProps {
  children: ReactNode
  options?: ReservoirClientOptions & ReservoirKitProviderOptions
  theme?: ReservoirKitTheme
  swrOptions?: ComponentPropsWithoutRef<typeof SWRConfig>['value']
}

import { createTheme, ReservoirKitThemeContext } from '../stitches.config'
import { swrDefaultOptions } from './lib/swr'

export const ThemeContext = createContext<undefined | ReservoirKitThemeContext>(
  undefined
)
export const ProviderOptionsContext =
  createContext<ReservoirKitProviderOptions>({})

const defaultOptions = {
  chains: [{ baseApiUrl: 'https://api.reservoir.tools', id: 1, active: true }],
}

const classNameObserverOptions = {
  attributeFilter: ['class'],
}

import calendarCss from './styles/calendar'
import useMutationObservable from './hooks/useMutationObservable'

export const ReservoirKitProvider: FC<ReservoirKitProviderProps> = function ({
  children,
  options = defaultOptions,
  theme,
  swrOptions = {},
}: ReservoirKitProviderProps) {
  const [globalTheme, setGlobalTheme] = useState<
    undefined | ReservoirKitThemeContext
  >()
  const [providerOptions, setProviderOptions] =
    useState<ReservoirKitProviderOptions>({})
  const currentTheme = useRef(null as any)
  const classNameCallback = useCallback(
    (mutationList: MutationRecord[]) => {
      mutationList.forEach((mutation) => {
        const body = mutation.target as HTMLBodyElement
        if (
          mutation.attributeName === 'class' &&
          body &&
          !body.className.includes(currentTheme.current)
        ) {
          document.body.classList.add(currentTheme.current)
        }
      })
    },
    [currentTheme]
  )

  useMutationObservable(
    classNameCallback,
    typeof window !== 'undefined' ? document.body : null,
    classNameObserverOptions
  )

  calendarCss()

  useEffect(() => {
    let newTheme = createTheme(theme ? (theme as any) : (darkTheme() as any))
    let oldTheme = currentTheme.current
    currentTheme.current = newTheme

    document.body.classList.add(newTheme)

    if (oldTheme) {
      document.body.classList.remove(oldTheme)
    }

    setGlobalTheme(newTheme as any)
  }, [JSON.stringify(theme)])

  useEffect(() => {
    setProviderOptions(options)
  }, [options])

  return (
    <ThemeContext.Provider value={globalTheme}>
      <TooltipPrimitive.Provider>
        <ProviderOptionsContext.Provider value={providerOptions}>
          <ReservoirClientProvider options={options}>
            <SWRConfig value={{ ...swrDefaultOptions, ...swrOptions }}>
              {children}
            </SWRConfig>
          </ReservoirClientProvider>
        </ProviderOptionsContext.Provider>
      </TooltipPrimitive.Provider>
    </ThemeContext.Provider>
  )
}
