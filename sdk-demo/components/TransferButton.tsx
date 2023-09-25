import { getClient } from './utils'
import { adaptEthersSigner } from '@reservoir0x/ethers-wallet-adapter'
import { useState } from 'react'
import { Address } from 'viem'
import { useSigner } from 'wagmi'

function TransferButton() {
  const { data: signer } = useSigner()
  const [to, setTo] = useState<Address>('0x72D04b5b45a8C800D01E13791d2396C8D160181a')
  const [token, setToken] = useState('0x932ca55b9ef0b3094e8fa82435b3b4c50d713043:19')

  return (
    <div
      style={{
        border: '1px solid black',
        padding: 10,
        borderRadius: 4,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      <div>
        <b>To:</b>
        <input value={to} onChange={(e) => setTo(e.target.value as Address) } style={{width:'100%'}} />
        </div>
        <div>
        <b>Token:</b>
        <input value={token} onChange={(e) => setToken(e.target.value) } style={{width:'100%'}}/>
      </div>
      <button
        onClick={() => {
          if (!signer) {
            throw 'Signer not available!'
          }

          getClient().actions.transferTokens({
            to: to,
            items: [
              {
                token: token,
                quantity: 1
              },
            ],
            wallet: adaptEthersSigner(signer),
            onProgress: (steps) => {
              console.log(steps)
            },
          })
        }}
      >
        Transfer
      </button>
    </div>
  )
}

export default TransferButton
