import type { AppProps } from 'next/app'
import React, {
  useState,
  useContext,
  ReactNode,
  Dispatch,
  SetStateAction,
  FC,
} from 'react'
import { darkTheme } from 'stitches.config'
import '@rainbow-me/rainbowkit/styles.css'
import { ThemeProvider } from 'next-themes'
import { RainbowKitProvider, getDefaultWallets } from '@rainbow-me/rainbowkit'
import { WagmiConfig, createClient, configureChains } from 'wagmi'
import * as allChains from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import '../fonts.css'
import {
  ReservoirKitProvider,
  darkTheme as defaultTheme,
  ReservoirKitTheme,
  CartProvider,
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
const NORMALIZE_ROYALTIES = process.env.NEXT_PUBLIC_NORMALIZE_ROYALTIES
  ? process.env.NEXT_PUBLIC_NORMALIZE_ROYALTIES === 'true'
  : false
const ALCHEMY_KEY = process.env.NEXT_PUBLIC_ALCHEMY_KEY || ''

const envChain = Object.values(allChains).find(
  (chain) => chain.id === +CHAIN_ID
)

const { chains, provider } = configureChains(
  [envChain || allChains.mainnet],
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

export const ThemeSwitcherContext = React.createContext<{
  theme: ReservoirKitTheme
  setTheme: Dispatch<SetStateAction<ReservoirKitTheme>> | null
}>({
  theme: defaultTheme(),
  setTheme: null,
})

const ThemeSwitcher: FC<any> = ({ children }) => {
  const [theme, setTheme] = useState(defaultTheme())

  return (
    <ThemeSwitcherContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeSwitcherContext.Provider>
  )
}

type AppWrapperProps = {
  children: ReactNode
}

const AppWrapper: FC<any> = ({ children }) => {
  const { theme } = useContext(ThemeSwitcherContext)

  return (
    <WagmiConfig client={wagmiClient}>
      <ReservoirKitProvider
        options={{
          apiBase: API_BASE,
          apiKey: API_KEY,
          marketplaceFee: FEE,
          marketplaceFeeRecipient: FEE_RECIPIENT,
          source: SOURCE,
          normalizeRoyalties: NORMALIZE_ROYALTIES,
        }}
        theme={theme}
      >
        <CartProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            value={{
              dark: darkTheme.className,
              light: 'light',
            }}
            enableSystem={false}
            storageKey={'demo-theme'}
          >
            <RainbowKitProvider chains={chains}>{children}</RainbowKitProvider>
          </ThemeProvider>
        </CartProvider>
      </ReservoirKitProvider>
    </WagmiConfig>
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
