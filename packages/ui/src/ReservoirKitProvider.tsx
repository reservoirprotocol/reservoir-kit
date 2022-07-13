import React, {
  createContext,
  FC,
  ReactNode,
  useEffect,
  useState,
  useRef,
} from 'react'
import { ReservoirClientOptions } from '@reservoir0x/reservoir-kit-core'
import { ReservoirKitTheme } from './themes/ReservoirKitTheme'
import { ReservoirCoreProvider } from './ReservoirCoreProvider'
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
  const currentTheme = useRef(null as any)

  useEffect(() => {
    if (theme) {
      let newTheme = createTheme(theme as any)
      let oldTheme = currentTheme.current

      currentTheme.current = newTheme

      document.body.classList.add(newTheme)

      if (oldTheme) {
        document.body.classList.remove(oldTheme)
      }

      setGlobalTheme(newTheme)
    }
  }, [JSON.stringify(theme)])

  return (
    <ThemeContext.Provider value={globalTheme}>
      <ReservoirCoreProvider options={options}>
        {children}
      </ReservoirCoreProvider>
    </ThemeContext.Provider>
  )
}
