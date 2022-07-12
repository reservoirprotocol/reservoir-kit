import React, { createContext, FC, ReactNode, useEffect, useState } from 'react'
import {
  ReservoirClientOptions,
  ReservoirSDK,
} from '@reservoir0x/reservoir-kit-core'
import { ReservoirKitTheme } from './themes/ReservoirKitTheme'

export interface ReservoirKitProviderProps {
  children: ReactNode
  options: ReservoirClientOptions
  theme?: ReservoirKitTheme
}

import { createTheme } from '../stitches.config'

export const ThemeContext = createContext('default')

export const ReservoirKitProvider: FC<ReservoirKitProviderProps> = function ({
  children,
  options,
  theme,
}: ReservoirKitProviderProps) {
  const [globalTheme, setGlobalTheme] = useState('')

  useEffect(() => {
    ReservoirSDK.init(options)
  }, [])

  useEffect(() => {
    if (theme) {
      let newTheme = createTheme('reservoirKit', theme as any)
      document.body.classList.add(newTheme)
      setGlobalTheme(newTheme)
    }
  }, [theme])

  return (
    <ThemeContext.Provider value={globalTheme}>
      {children}
    </ThemeContext.Provider>
  )
}
