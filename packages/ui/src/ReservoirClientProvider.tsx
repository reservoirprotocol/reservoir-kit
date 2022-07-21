import React, { createContext, FC, ReactNode, useState } from 'react'
import {
  ReservoirClientOptions,
  ReservoirClient,
} from '@reservoir0x/reservoir-kit-client'

export interface ReservoirClientProviderProps {
  children: ReactNode
  options: ReservoirClientOptions
}

export const ReservoirClientContext = createContext<ReservoirClient | null>(
  null
)

export const ReservoirClientProvider: FC<ReservoirClientProviderProps> =
  function ({ children, options }: ReservoirClientProviderProps) {
    const [clientContext, _] = useState<ReservoirClient | null>(
      ReservoirClient.init(options)
    )

    return (
      <ReservoirClientContext.Provider value={clientContext}>
        {children}
      </ReservoirClientContext.Provider>
    )
  }
