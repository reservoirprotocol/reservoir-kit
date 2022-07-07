import React, { ReactNode, useEffect } from 'react'
import { ReservoirClientOptions, ReservoirSDK } from '@reservoir0x/client-sdk'

export interface ReservoirKitProviderProps {
  children: ReactNode
  options: ReservoirClientOptions
}

export const ReservoirKitProvider = function ({
  children,
  options,
}: ReservoirKitProviderProps) {
  useEffect(() => {
    ReservoirSDK.init(options)
  }, [])

  return <>{children}</>
}
