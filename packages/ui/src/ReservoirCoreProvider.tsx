import React, { createContext, FC, ReactNode, useState } from 'react'
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
  const [sdkContext, _] = useState<ReservoirSDK | null>(
    ReservoirSDK.init(options)
  )

  return (
    <ReservoirCoreContext.Provider value={sdkContext}>
      {children}
    </ReservoirCoreContext.Provider>
  )
}
