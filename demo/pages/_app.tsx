import type { AppProps } from 'next/app'
import { darkTheme, globalReset } from 'stitches.config'
import '@rainbow-me/rainbowkit/styles.css'
import { ThemeProvider } from 'next-themes'
import { RainbowKitProvider, getDefaultWallets } from '@rainbow-me/rainbowkit'
import { WagmiConfig, createClient, configureChains, chain } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'
import { ReservoirKitProvider } from '@reservoir0x/reservoir-kit'

const { chains, provider } = configureChains(
  [chain.mainnet, chain.rinkeby],
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

function MyApp({ Component, pageProps }: AppProps) {
  globalReset()

  return (
    <ReservoirKitProvider
      options={{ apiBase: 'https://api-rinkeby.reservoir.tools' }}
    >
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        value={{
          dark: darkTheme.className,
          light: 'light',
        }}
      >
        <WagmiConfig client={wagmiClient}>
          <RainbowKitProvider chains={chains}>
            {/* @ts-ignore */}
            <Component {...pageProps} />
          </RainbowKitProvider>
        </WagmiConfig>
      </ThemeProvider>
    </ReservoirKitProvider>
  )
}

export default MyApp
