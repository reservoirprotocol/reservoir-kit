import { getClient } from './utils'
import { adaptEthersSigner } from '@reservoir0x/ethers-wallet-adapter'
import { useSigner } from 'wagmi'

function ListButton() {
  const { data: signer } = useSigner()
  const price = '1000000000000000000'
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
        <b>Price:</b>
        {price}
      </div>
      <button
        onClick={() => {
          if (!signer) {
            throw Error('Signer not available!')
          }

          getClient().actions.listToken({
            listings: [
              {
                token: "0x1193af965786fc46a63cb4d92c33a48219d1c8b6:678",
                weiPrice: price,
                orderbook: 'blur',
                orderKind: 'blur',
                expirationTime: '1720025956'
              },
            ],
            wallet: adaptEthersSigner(signer),
            onProgress: () => {},
          })
        }}
      >
        List Token
      </button>
    </div>
  )
}

export default ListButton
