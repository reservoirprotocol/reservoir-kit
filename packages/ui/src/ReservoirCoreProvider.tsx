import React, { createContext, FC, ReactNode, useEffect, useState } from 'react'
import {
  ReservoirClientOptions,
  ReservoirSDK,
} from '@reservoir0x/reservoir-kit-core'

export interface ReservoirCoreProviderProps {
  children: ReactNode
  options: ReservoirClientOptions
}

type ReservoirCoreContext = {
  initialized: boolean
}

export const ReservoirCoreContext = createContext<ReservoirCoreContext>({
  initialized: false,
})

export const ReservoirCoreProvider: FC<ReservoirCoreProviderProps> = function ({
  children,
  options,
}: ReservoirCoreProviderProps) {
  const [sdkContext, setSdkContext] = useState<ReservoirCoreContext>({
    initialized: false,
  })

  useEffect(() => {
    ReservoirSDK.init(options)
    setSdkContext({
      initialized: true,
    })
  }, [])

  return (
    <ReservoirCoreContext.Provider value={sdkContext}>
      {children}
    </ReservoirCoreContext.Provider>
  )
}
