import type { AppProps } from 'next/app'
import React, { useState, useContext } from 'react'
import { darkTheme } from 'stitches.config'
import '@rainbow-me/rainbowkit/styles.css'
import { ThemeProvider } from 'next-themes'
import { RainbowKitProvider, getDefaultWallets } from '@rainbow-me/rainbowkit'
import {
  WagmiConfig,
  createClient,
  configureChains,
  chain,
  allChains,
} from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import '../fonts.css'
import {
  ReservoirKitProvider,
  darkTheme as defaultTheme,
} from '@reservoir0x/reservoir-kit-ui'
const API_KEY = process.env.NEXT_PUBLIC_API_KEY
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || 'https://api.reservoir.tools'
const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID || 1
const SOURCE = process.env.NEXT_PUBLIC_SOURCE || 'reservoirkit.demo'
const FEE = process.env.NEXT_PUBLIC_MARKETPLACE_FEE
  ? +process.env.NEXT_PUBLIC_MARKETPLACE_FEE
  : undefined
const FEE_RECIPIENT =
  process.env.NEXT_PUBLIC_MARKETPLACE_FEE_RECIPIENT || undefined
const REFERRAL_FEE = process.env.NEXT_PUBLIC_REFERRAL_FEE
  ? +process.env.NEXT_PUBLIC_REFERRAL_FEE
  : undefined
const REFERRAL_FEE_RECIPIENT =
  process.env.NEXT_PUBLIC_REFERRAL_FEE_RECIPIENT || undefined
const NORMALIZE_ROYALTIES = process.env.NEXT_PUBLIC_NORMALIZE_ROYALTIES
  ? process.env.NEXT_PUBLIC_NORMALIZE_ROYALTIES === 'true'
  : false
const ALCHEMY_KEY = process.env.NEXT_PUBLIC_ALCHEMY_KEY || undefined

const envChain = allChains.find((chain) => chain.id === +CHAIN_ID)

const { chains, provider } = configureChains(
  [envChain || chain.mainnet],
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
        apiBase: API_BASE,
        apiKey: API_KEY,
        marketplaceFee: FEE,
        marketplaceFeeRecipient: FEE_RECIPIENT,
        referralFee: REFERRAL_FEE,
        referralFeeRecipient: REFERRAL_FEE_RECIPIENT,
        source: SOURCE,
        normalizeRoyalties: NORMALIZE_ROYALTIES,
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
