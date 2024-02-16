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
                token: "0x473989bf6409d21f8a7fdd7133a40f9251cc1839:1",
                weiPrice: price,
                orderbook: 'reservoir',
                orderKind: 'seaport-v1.5',
                expirationTime: '1707769831'
              },
              {
                token: "0x78f887a92602bb58cc7a8bba3fb83a11393568fc:67875155203898376266226417105519496041030022655099455128664563017684613070948",
                weiPrice: price,
                orderbook: 'reservoir',
                orderKind: 'seaport-v1.5',
                expirationTime: '1707769831'
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
