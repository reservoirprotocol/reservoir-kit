import type { AppProps } from 'next/app'
import React, {
  useState,
  useContext,
  ReactNode,
  Dispatch,
  SetStateAction,
  FC,
  useEffect,
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
import { LogLevel, customChains } from '@reservoir0x/reservoir-sdk'
import configuredChains from '../utils/chains'
import { useRouter } from 'next/router'
import '../fonts.css'
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
    allChains.scroll,
    allChains.arbitrumNova,
    customChains.frameTestnet
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

export const ChainSwitcherContext = React.createContext<{
  chain: number | null
  setChain: Dispatch<SetStateAction<number | null>> | null
}>({
  chain: CHAIN_ID,
  setChain: null,
})

const ChainSwitcher: FC<any> = ({ children }) => {
  const router = useRouter()
  const [chain, setChain] = useState<number | null>(null)

  useEffect(() => {
    if(!chain && router.query.chainId) {
      const routerChainId = Number(router.query.chainId)
      setChain(routerChainId)
    }
  }, [router.query.chainId])
  
  return (
    <ChainSwitcherContext.Provider value={{ chain, setChain }}>
      {children}
    </ChainSwitcherContext.Provider>
  )
}

type AppWrapperProps = {
  children: ReactNode
}

const AppWrapper: FC<AppWrapperProps> = ({ children }) => {
  const { theme } = useContext(ThemeSwitcherContext)
  const { chain } = useContext(ChainSwitcherContext)

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
          chains: configuredChains.map((c) => {
            return {
              ...c,
              active: chain === c.id,
            }
          }),
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
    <ChainSwitcher>
      <ThemeSwitcher>
        <AppWrapper>
          {/* @ts-ignore */}
          <Component {...pageProps} />
        </AppWrapper>
      </ThemeSwitcher>
    </ChainSwitcher>
  )
}

export default MyApp
