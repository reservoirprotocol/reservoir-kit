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
import { configureChains } from 'wagmi'
import * as allChains from 'wagmi/chains'
import { PrivyProvider } from '@privy-io/react-auth'
import { PrivyWagmiConnector } from '@privy-io/wagmi-connector'

import { publicProvider } from 'wagmi/providers/public'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import '../fonts.css'
import {
  ReservoirKitProvider,
  darkTheme as defaultTheme,
  ReservoirKitTheme,
  CartProvider,
} from '@reservoir0x/reservoir-kit-ui'
import {
  LogLevel,
  customChains,
  reservoirChains,
} from '@reservoir0x/reservoir-sdk'
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
const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''

const configureChainsConfig = configureChains(
  [
    allChains.mainnet,
    allChains.goerli,
    allChains.sepolia,
    allChains.polygon,
    allChains.optimism,
    allChains.arbitrum,
    allChains.zora,
    allChains.base,
    allChains.avalanche,
    allChains.linea,
  ],
  [alchemyProvider({ apiKey: ALCHEMY_KEY }), publicProvider()]
)

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
  const cartFeeUsd = router.query.cartFeeUsd
    ? JSON.parse(router.query.cartFeeUsd as string)
    : undefined

  return (
    <PrivyProvider
        appId={PRIVY_APP_ID}
        config={{
          appearance: { 
            theme:'dark'
          }
        }}
      >
    <PrivyWagmiConnector wagmiChainsConfig={configureChainsConfig}>
      <ReservoirKitProvider
        options={{
          apiKey: API_KEY,
          chains: [
            {
              ...reservoirChains.mainnet,
              active: CHAIN_ID === allChains.mainnet.id,
            },
            {
              ...reservoirChains.goerli,
              active: CHAIN_ID === allChains.goerli.id,
              paymentTokens: [
                ...reservoirChains.goerli.paymentTokens,
                {
                  address: '0x68B7E050E6e2C7eFE11439045c9d49813C1724B8',
                  symbol: 'phUSDC',
                  name: 'phUSDC',
                  decimals: 6,
                  coinGeckoId: 'usd-coin',
                },
                {
                  address: '0x11fE4B6AE13d2a6055C8D9cF65c55bac32B5d844',
                  symbol: 'DAI',
                  name: 'Dai',
                  decimals: 18,
                  coinGeckoId: 'dai',
                },
              ],
            },
            {
              ...reservoirChains.sepolia,
              active: CHAIN_ID === allChains.sepolia.id
            },
            {
              ...reservoirChains.polygon,
              active: CHAIN_ID === allChains.polygon.id,
            },
            {
              ...reservoirChains.optimism,
              active: CHAIN_ID === allChains.optimism.id,
            },
            {
              ...reservoirChains.arbitrum,
              active: CHAIN_ID === allChains.arbitrum.id,
            },
            {
              ...reservoirChains.zora,
              active: CHAIN_ID === allChains.zora.id,
            },
            {
              ...reservoirChains.base,
              active: CHAIN_ID === allChains.base.id,
            },
            {
              ...reservoirChains.linea,
              active: CHAIN_ID === allChains.linea.id,
            },
            {
              ...reservoirChains.arbitrumNova,
              active: CHAIN_ID === allChains.arbitrumNova.id
            },
            {
              ...reservoirChains.ancient8Testnet,
              id: customChains.ancient8Testnet.id,
              active: CHAIN_ID === customChains.ancient8Testnet.id,
            }
          ],
          marketplaceFees: MARKETPLACE_FEES,
          source: SOURCE,
          normalizeRoyalties: NORMALIZE_ROYALTIES,
          logLevel: LogLevel.Verbose,
        }}
        theme={theme}
      >
        <CartProvider feesOnTopBps={cartFeeBps} feesOnTopUsd={cartFeeUsd}>
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
            {children}
          </ThemeProvider>
        </CartProvider>
      </ReservoirKitProvider>
    </PrivyWagmiConnector>
    </PrivyProvider>
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
