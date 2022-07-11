import React, { createContext, FC, ReactNode, useEffect, useState } from 'react'
import {
  ReservoirClientOptions,
  ReservoirSDK,
} from '@reservoir0x/reservoir-kit-core'
import { defaultTheme, ReservoirKitTheme } from './themes/ReservoirKitTheme'

export interface ReservoirKitProviderProps {
  children: ReactNode
  options: ReservoirClientOptions
  theme?: ReservoirKitTheme
}

export const ThemeContext = createContext<ReservoirKitTheme>(defaultTheme())

export const ReservoirKitProvider: FC<ReservoirKitProviderProps> = function ({
  children,
  options,
  theme,
}: ReservoirKitProviderProps) {
  const [globalTheme, setGlobalTheme] = useState(defaultTheme())

  useEffect(() => {
    ReservoirSDK.init(options)
  }, [])

  useEffect(() => {
    if (theme) {
      setGlobalTheme(theme)
    }
  }, [theme])

  return (
    <ThemeContext.Provider value={globalTheme}>
      {children}
    </ThemeContext.Provider>
  )
}
