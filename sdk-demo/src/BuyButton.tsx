import { getClient } from 'src/utils'
import { adaptEthersSigner } from '@reservoir0x/ethers-wallet-adapter'
import { useSigner } from 'wagmi'

function BuyButton() {
  const { data: signer } = useSigner()
  const collectionId = '0x8a77e2b6d75339c5fe7a03cd10c1bbeb34ecc6fd'
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
    </div>
  )
}

export default BuyButton
