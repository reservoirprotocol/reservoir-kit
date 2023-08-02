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
import { ThemeProvider } from 'next-themes'
import { RainbowKitProvider, getDefaultWallets } from '@rainbow-me/rainbowkit'
import { WagmiConfig, createConfig, configureChains } from 'wagmi'
import * as allChains from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import '../fonts.css'
import '@rainbow-me/rainbowkit/styles.css'
import {
  ReservoirKitProvider,
  darkTheme as defaultTheme,
  ReservoirKitTheme,
  CartProvider,
} from '@reservoir0x/reservoir-kit-ui'
import { LogLevel, customChains } from '@reservoir0x/reservoir-sdk'
import { useRouter } from 'next/router'
const API_KEY = process.env.NEXT_PUBLIC_API_KEY
const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 1)
const SOURCE = process.env.NEXT_PUBLIC_SOURCE || 'reservoirkit.demo'
const MARKETPLACE_FEES = process.env.NEXT_PUBLIC_MARKETPLACE_FEES
  ? (JSON.parse(process.env.NEXT_PUBLIC_MARKETPLACE_FEES) as string[])
  : undefined
const NORMALIZE_ROYALTIES = process.env.NEXT_PUBLIC_NORMALIZE_ROYALTIES
  ? process.env.NEXT_PUBLIC_NORMALIZE_ROYALTIES === 'true'
  : false
const ALCHEMY_KEY = process.env.NEXT_PUBLIC_ALCHEMY_KEY || ''
const WALLET_CONNECT_PROJECT_ID =
  process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || ''

const { chains, publicClient } = configureChains(
  [
    allChains.mainnet,
    allChains.goerli,
    allChains.polygon,
    allChains.optimism,
    allChains.arbitrum,
    allChains.zora,
    customChains.base,
    allChains.avalanche,
    customChains.linea,
  ],
  [alchemyProvider({ apiKey: ALCHEMY_KEY }), publicProvider()]
)

const { connectors } = getDefaultWallets({
  appName: 'Reservoir Kit',
  projectId: WALLET_CONNECT_PROJECT_ID,
  chains,
})

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
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
  const router = useRouter()
  const cartFeeBps = router.query.cartFeeBps
    ? JSON.parse(router.query.cartFeeBps as string)
    : undefined

  return (
    <WagmiConfig config={wagmiConfig}>
      <ReservoirKitProvider
        options={{
          apiKey: API_KEY,
          chains: [
            {
              baseApiUrl: 'https://api.reservoir.tools',
              id: allChains.mainnet.id,
              active: CHAIN_ID === allChains.mainnet.id,
            },
            {
              baseApiUrl: 'https://api-goerli.reservoir.tools',
              id: allChains.goerli.id,
              active: CHAIN_ID === allChains.goerli.id,
            },
            {
              baseApiUrl: 'https://api-polygon.reservoir.tools',
              id: allChains.polygon.id,
              active: CHAIN_ID === allChains.polygon.id,
            },
            {
              baseApiUrl: 'https://api-optimism.reservoir.tools',
              id: allChains.optimism.id,
              active: CHAIN_ID === allChains.optimism.id,
            },
            {
              baseApiUrl: 'https://api-arbitrum.reservoir.tools',
              id: allChains.arbitrum.id,
              active: CHAIN_ID === allChains.arbitrum.id,
            },
            {
              baseApiUrl: 'https://api-zora.reservoir.tools',
              id: allChains.zora.id,
              active: CHAIN_ID === allChains.zora.id,
            },
            {
              baseApiUrl: 'https://api-base.reservoir.tools',
              id: customChains.base.id,
              active: CHAIN_ID === customChains.base.id,
            },
            {
              baseApiUrl: 'https://api-linea.reservoir.tools',
              id: customChains.linea.id,
              active: CHAIN_ID === customChains.linea.id,
            },
          ],
          marketplaceFees: MARKETPLACE_FEES,
          source: SOURCE,
          normalizeRoyalties: NORMALIZE_ROYALTIES,
          logLevel: LogLevel.Verbose,
        }}
        theme={theme}
      >
        <CartProvider feesOnTopBps={cartFeeBps}>
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
