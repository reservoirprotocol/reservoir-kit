import type { AppProps } from 'next/app'
import { globalReset } from 'stitches.config'
import '@rainbow-me/rainbowkit/styles.css'
import { RainbowKitProvider, getDefaultWallets } from '@rainbow-me/rainbowkit'
import { WagmiConfig, createClient, configureChains, chain } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'

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
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        {/* @ts-ignore */}
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>
  )
}

export default MyApp
