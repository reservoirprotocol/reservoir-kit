'use client'

import React from 'react'
import './globals.css'
import {
  ConnectButton,
  RainbowKitProvider,
  getDefaultWallets,
} from '@rainbow-me/rainbowkit'
import { publicProvider } from 'wagmi/providers/public'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import * as allChains from 'wagmi/chains'
import { WagmiConfig, createClient, configureChains } from 'wagmi'
import '@rainbow-me/rainbowkit/styles.css'
import Actions from '../components/Actions'

const ALCHEMY_KEY = process.env.NEXT_PUBLIC_ALCHEMY_KEY || ''
const { chains, provider } = configureChains(
  [allChains.mainnet],
  [alchemyProvider({ apiKey: ALCHEMY_KEY }), publicProvider()]
)

const { connectors } = getDefaultWallets({
  appName: 'Reservoir Kit',
  chains,
})

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
})

export default function App() {
  return (
    <WagmiConfig client={wagmiClient}>
      <div
        className="App"
        style={{
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
        }}
      >
        <h1>Reservoir SDK Demo</h1>
        <RainbowKitProvider chains={chains}>
          <ConnectButton />
          <Actions />
        </RainbowKitProvider>
      </div>
    </WagmiConfig>
  )
}
