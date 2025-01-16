import { NextPage } from 'next'
import { useReservoirClient } from '@reservoir0x/reservoir-kit-ui'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import ThemeSwitcher from 'components/ThemeSwitcher'
import { useState } from 'react'
import ChainSwitcher from 'components/ChainSwitcher'
import { ReservoirClient } from '@reservoir0x/reservoir-sdk'
import { useWalletClient } from 'wagmi'

const BuyActionPage: NextPage = () => {
  const client: ReservoirClient | null = useReservoirClient()
  const [currencyChainId, setCurrencyChainId] = useState<number>(1)
  const [currency, setCurrency] = useState<string>('')
  const [token, setToken] = useState<string>('')
  const { data: wallet } = useWalletClient({
    chainId: client?.currentChain()?.id,
  })
  return (
    <div
      style={{
        display: 'flex',
        height: 50,
        width: '100%',
        gap: 12,
        padding: 24,
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 150,
      }}
    >
      <ConnectButton />
      <div>
        <label>Currency Chain: </label>
        <input
          type="number"
          placeholder="Which chain the currency is on?"
          value={currencyChainId}
          onChange={(e) => setCurrencyChainId(Number(e.target.value))}
        />
      </div>
      <div>
        <label>Currency address: </label>
        <input
          type="string"
          placeholder="Which is the currency address?"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
        />
      </div>
      <div>
        <label>Token Address: </label>
        <input
          type="string"
          placeholder="Address of the token?"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
      </div>

      <button
        style={{
          marginTop: 50,
          padding: 24,
          background: 'blue',
          color: 'white',
          fontSize: 18,
          border: '1px solid #ffffff',
          borderRadius: 8,
          fontWeight: 800,
          cursor: 'pointer',
        }}
        onClick={() => {
          if (!wallet) {
            throw 'Please connect to execute transactions'
          }
          client?.actions.buyToken({
            wallet,
            options: {
              currencyChainId,
              currency,
            },
            items: [{ token }],
            onProgress: (steps, fees) => {
              console.log(steps, fees)
            },
          })
        }}
      >
        Buy
      </button>
      <ChainSwitcher />
      <ThemeSwitcher />
    </div>
  )
}

export default BuyActionPage
