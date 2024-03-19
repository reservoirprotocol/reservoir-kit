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
import {  http } from 'wagmi'
import { PrivyProvider } from '@privy-io/react-auth'
import * as allChains from 'wagmi/chains'
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
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { chainIdToAlchemyNetworkMap } from 'utils/chainIdToAlchemyNetworkMap'
import { Chain } from 'wagmi/chains'
import { createConfig } from '@privy-io/wagmi'
import {WagmiProvider} from '@privy-io/wagmi';
import { _transports } from '@rainbow-me/rainbowkit/dist/config/getDefaultConfig'

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


  const chains = [
    allChains.mainnet,
    allChains.goerli,
    allChains.sepolia,
    allChains.polygon,
    allChains.polygonMumbai,
    allChains.optimism,
    allChains.arbitrum,
    allChains.zora,
    allChains.base,
    allChains.avalanche,
    allChains.linea,
    allChains.scroll,
    allChains.arbitrumNova,
    customChains.frameTestnet,
    customChains.astarZkEVM,
  ] as [
    Chain,
    ...Chain[]
  ]

  const wagmiConfig = createConfig({
    chains,
    ssr: true,
    transports: chains.reduce((transportsConfig: _transports, chain) => {
      const network = chainIdToAlchemyNetworkMap[chain.id]
      if (network && ALCHEMY_KEY) {
        transportsConfig[chain.id] = http(
          `https://${network}.g.alchemy.com/v2/${ALCHEMY_KEY}`
        )
      } else {
        transportsConfig[chain.id] = http() // Fallback to default HTTP transport
      }
      return transportsConfig
    }, {}),
  })

const queryClient = new QueryClient()

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
        <QueryClientProvider client={queryClient}>
          <WagmiProvider config={wagmiConfig}>
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
          </WagmiProvider>
        </QueryClientProvider>
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
