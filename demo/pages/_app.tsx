import type { AppProps } from 'next/app'
import React, { useState, useContext } from 'react'
import { darkTheme } from 'stitches.config'
import '@rainbow-me/rainbowkit/styles.css'
import { ThemeProvider } from 'next-themes'
import { RainbowKitProvider, getDefaultWallets } from '@rainbow-me/rainbowkit'
import { WagmiConfig, createClient, configureChains, chain } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'
import '../fonts.css'
import {
  ReservoirKitProvider,
  darkTheme as defaultTheme,
} from '@reservoir0x/reservoir-kit-ui'
const API_KEY = process.env.NEXT_PUBLIC_API_KEY

const { chains, provider } = configureChains(
  [chain.mainnet, chain.goerli],
  [publicProvider()]
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

export const ThemeSwitcherContext = React.createContext({
  theme: defaultTheme(),
  setTheme: null,
})

const ThemeSwitcher = ({ children }) => {
  const [theme, setTheme] = useState(defaultTheme())

  return (
    <ThemeSwitcherContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeSwitcherContext.Provider>
  )
}

const AppWrapper = ({ children }) => {
  const { theme } = useContext(ThemeSwitcherContext)

  return (
    <ReservoirKitProvider
      options={{
        apiBase: 'https://api-goerli.reservoir.tools',
        apiKey: API_KEY,
        marketplaceFee: 100,
        marketplaceFeeRecipient: '0x0CccD55A5Ac261Ea29136831eeaA93bfE07f5Db6',
        referralFee: 200,
        referralFeeRecipient: '0x0CccD55A5Ac261Ea29136831eeaA93bfE07f5Db6',
        source: 'pedro.market',
      }}
      theme={theme}
    >
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        value={{
          dark: darkTheme.className,
          light: 'light',
        }}
      >
        <WagmiConfig client={wagmiClient}>
          <RainbowKitProvider chains={chains}>{children}</RainbowKitProvider>
        </WagmiConfig>
      </ThemeProvider>
    </ReservoirKitProvider>
  )
}

function MyApp({ Component, pageProps }: AppProps) {
  const [theme, setTheme] = useState(defaultTheme())

  return (
    <ThemeSwitcher>
      <AppWrapper>
        {/* @ts-ignore */}
        <Component {...pageProps} />
      </AppWrapper>
    </ThemeSwitcher>
  )
}

export default MyApp
