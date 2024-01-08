import { NextPage } from 'next'
import { useReservoirClient } from '@reservoir0x/reservoir-kit-ui'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import ThemeSwitcher from 'components/ThemeSwitcher'
import { useState } from 'react'
import ChainSwitcher from 'components/ChainSwitcher'
import { ReservoirClient, prepareCallTransaction } from '@reservoir0x/reservoir-sdk'
import { useWalletClient } from 'wagmi'

const CallActionPage: NextPage = () => {
  const client: ReservoirClient | null = useReservoirClient()
  const [txs, setTxs] = useState<string[]>([])
  const [tx, setTx] = useState<string>("")
  const [toChainId, setToChainId] = useState<number>(1)
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
      <input type="number" placeholder='Which chain to interact with?' value={toChainId} onChange={(e) => setToChainId(Number(e.target.value))} />
      <textarea style={{minHeight: 100, minWidth: 300}} placeholder='Add a transaction object, must be valid json: {to: "", data: "", value: ""}' value={tx} onChange={(e) => setTx(e.target.value)}/>
      <button
      style={{
        background: 'blue',
        color: 'white',
        border: '1px solid #ffffff',
        borderRadius: 8,
        cursor: 'pointer',
        padding: "4px 8px",
      }}
        disabled={!tx}
        onClick={() => {
          setTxs([...txs, JSON.parse(`${tx}`)])
        }}
      >
        Add Transaction
      </button>
      <div
        style={{
          marginTop: 10,
          border: '1px solid gray',
          borderRadius: 4,
          padding: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        <b>Txs Added:</b>
        {txs.map((tx, i) => (
          <div key={i}>
            {JSON.stringify(tx)}
          </div>
        ))}
      </div>
      <button style={{
              marginTop: 50,
              padding: 24,
              background: 'blue',
              color: 'white',
              fontSize: 18,
              border: '1px solid #ffffff',
              borderRadius: 8,
              fontWeight: 800,
              cursor: 'pointer',
            }} onClick={() => {
        if (!wallet) {
          throw "Please connect to execute transactions"
        }
        client?.actions.call({
          wallet,
          txs: txs as any,
          toChainId,
          onProgress: (steps, fees) => {
            console.log(steps, fees)
          }
        })
      }}>
        Execute Transactions
      </button>
      <ChainSwitcher /> 
      <ThemeSwitcher />
    </div>
  )
}

export default CallActionPage
