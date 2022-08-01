import React, {
  createContext,
  FC,
  ReactNode,
  useEffect,
  useState,
  useRef,
} from 'react'
import { ReservoirClientOptions } from '@reservoir0x/reservoir-kit-client'
import { ReservoirKitTheme, darkTheme } from './themes'
import { ReservoirClientProvider } from './ReservoirClientProvider'

type ReservoirKitProviderOptions = {
  disablePoweredByReservoir?: boolean
}
export interface ReservoirKitProviderProps {
  children: ReactNode
  options?: ReservoirClientOptions & ReservoirKitProviderOptions
  theme?: ReservoirKitTheme
}

import { createTheme, ReservoirKitThemeContext } from '../stitches.config'

export const ThemeContext = createContext<undefined | ReservoirKitThemeContext>(
  undefined
)
export const ProviderOptionsContext =
  createContext<ReservoirKitProviderOptions>({})

const defaultOptions = {
  apiBase: 'https://api.reservoir.tools',
  apiKey: '',
}

export const ReservoirKitProvider: FC<ReservoirKitProviderProps> = function ({
  children,
  options = defaultOptions,
  theme,
}: ReservoirKitProviderProps) {
  const [globalTheme, setGlobalTheme] = useState<
    undefined | ReservoirKitThemeContext
  >()
  const [providerOptions, setProviderOptions] =
    useState<ReservoirKitProviderOptions>({})
  const currentTheme = useRef(null as any)

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
          {children}
        </ReservoirClientProvider>
      </ProviderOptionsContext.Provider>
    </ThemeContext.Provider>
  )
}
