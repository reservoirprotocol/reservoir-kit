import { getClient } from './utils'
import { adaptEthersSigner } from '@reservoir0x/ethers-wallet-adapter'
import { useSigner } from 'wagmi'
import { adaptGelatoRelayer } from '@reservoir0x/gelato-adapter'

function BuyButton() {
  const { data: signer } = useSigner()
  const collectionId = '0x05a0b0985ba3b7bd9ade8a7478caa2fa4fda24e5'

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
        <b>CollectionId:</b>
        {collectionId}
      </div>
      <button
        onClick={() => {
          if (!signer) {
            throw 'Signer not available!'
          }

          getClient().actions.buyToken({
            items: [
              {
                collection: collectionId,
              },
            ],
            wallet: adaptEthersSigner(signer),
            onProgress: () => {},
          })
        }}
      >
        Buy
      </button>
      <button
        onClick={() => {
          if (!signer) {
            throw 'Signer not available!'
          }
          getClient().actions.buyToken({
            items: [
              {
                collection: '0xd8560c88d1dc85f9ed05b25878e366c49b68bef9',
              },
            ],
            options: {
              usePermit: true,
              currency: '0x07865c6e87b9f70255377e024ace6630c1eaa37f',
            },
            wallet: adaptGelatoRelayer(
              signer,
              process.env.GELATO_API_KEY || ''
            ),
            onProgress: () => {},
          })
        }}
      >
        Buy with Gelato adapter (API key)
      </button>
      <button
        onClick={() => {
          if (!signer) {
            throw 'Signer not available!'
          }
          getClient().actions.buyToken({
            items: [
              {
                collection: '0xd8560c88d1dc85f9ed05b25878e366c49b68bef9',
              },
            ],
            options: {
              usePermit: true,
              currency: '0x07865c6e87b9f70255377e024ace6630c1eaa37f',
            },
            wallet: adaptGelatoRelayer(signer, undefined, "/api/relay"),
            onProgress: () => {},
          })
        }}
      >
        Buy with Gelato adapter (proxy API)
      </button>
    </div>
  )
}

export default BuyButton
