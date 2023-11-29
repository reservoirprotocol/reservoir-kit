import { getClient } from './utils'
import { adaptEthersSigner } from '@reservoir0x/ethers-wallet-adapter'
import { useSigner } from 'wagmi'
import { adaptGelatoRelayer } from '@reservoir0x/gelato-adapter'
import { useState } from 'react'

function MintButton() {
  const { data: signer } = useSigner()
  const [collection, setCollection] = useState('0x9eddea849a70e0dcaf76f3c7083423dbe65ab291')
  const [token, setToken] = useState<string | undefined>(undefined)
  const [quantity, setQuantity] = useState(1)

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
        <b>Collection:</b>
        <input value={collection} onChange={(e) => setCollection(e.target.value) } style={{width:'100%'}}/>
      </div>
      <div>
        <b>Token:</b>
        <input value={token} onChange={(e) => setToken(e.target.value) } style={{width:'100%'}}/>
      </div>
      <div>
        <b>Quantity:</b>
        <input value={quantity} type='number' onChange={(e) => setQuantity(Number(e.target.value))} style={{width: '100%'}} />
      </div>
      <button
        onClick={() => {
          if (!signer) {
            throw 'Signer not available!'
          }

          getClient().actions.mintToken({
            items: [
              {
                collection: collection,
                token: token,
                quantity: quantity
              },
            ],
            wallet: adaptEthersSigner(signer),
            onProgress: () => {},
          })
        }}
      >
        Mint
      </button>
      <button
        onClick={() => {
          if (!signer) {
            throw 'Signer not available!'
          }
          getClient().actions.mintToken({
            items: [
              {
                collection: '0xd8560c88d1dc85f9ed05b25878e366c49b68bef9',
              },
            ],
            wallet: adaptGelatoRelayer(
              signer,
              process.env.GELATO_API_KEY || ''
            ),
            onProgress: () => {},
          })
        }}
      >
        Mint with Gelato adapter (API key)
      </button>
      <button
        onClick={() => {
          if (!signer) {
            throw 'Signer not available!'
          }
          getClient().actions.mintToken({
            items: [
              {
                collection: '0xd8560c88d1dc85f9ed05b25878e366c49b68bef9',
              },
            ],
            options: {
             
            },
            wallet: adaptGelatoRelayer(signer, undefined, '/api/relay'),
            onProgress: () => {},
          })
        }}
      >
        Mint with Gelato adapter (proxy API)
      </button>
    </div>
  )
}

export default MintButton