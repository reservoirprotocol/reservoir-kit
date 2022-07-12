import React, { createContext, FC, ReactNode, useEffect, useState } from 'react'
import {
  ReservoirClientOptions,
  ReservoirSDK,
} from '@reservoir0x/reservoir-kit-core'

export interface ReservoirCoreProviderProps {
  children: ReactNode
  options: ReservoirClientOptions
}

export const ReservoirCoreContext = createContext<ReservoirSDK | null>(null)

export const ReservoirCoreProvider: FC<ReservoirCoreProviderProps> = function ({
  children,
  options,
}: ReservoirCoreProviderProps) {
  const [sdkContext, setSdkContext] = useState<ReservoirSDK | null>(null)

  useEffect(() => {
    setSdkContext(ReservoirSDK.init(options))
  }, [])

  return (
    <ReservoirCoreContext.Provider value={sdkContext}>
      {children}
    </ReservoirCoreContext.Provider>
  )
}
