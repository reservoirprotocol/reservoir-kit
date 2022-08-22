import React, {
  createContext,
  FC,
  ReactNode,
  useEffect,
  useState,
  useRef,
  ComponentPropsWithoutRef,
} from 'react'
import { ReservoirClientOptions } from '@reservoir0x/reservoir-kit-client'
import { ReservoirKitTheme, darkTheme } from './themes'
import { ReservoirClientProvider } from './ReservoirClientProvider'
import { SWRConfig } from 'swr'

type ReservoirKitProviderOptions = {
  disablePoweredByReservoir?: boolean
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
  apiBase: 'https://api.reservoir.tools',
  apiKey: '',
}

import calendarCss from './styles/calendar'

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
      <ProviderOptionsContext.Provider value={providerOptions}>
        <ReservoirClientProvider options={options}>
          <SWRConfig value={{ ...swrDefaultOptions, ...swrOptions }}>
            {children}
          </SWRConfig>
        </ReservoirClientProvider>
      </ProviderOptionsContext.Provider>
    </ThemeContext.Provider>
  )
}
