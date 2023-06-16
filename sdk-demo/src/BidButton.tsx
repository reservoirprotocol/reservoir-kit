import { getClient } from 'src/utils'
import { adaptEthersSigner } from '@reservoir0x/ethers-wallet-adapter'
import { useSigner } from 'wagmi'

function BidButton() {
  const { data: signer } = useSigner()
  const collectionId = '0x8a77e2b6d75339c5fe7a03cd10c1bbeb34ecc6fd'
  const price = '100000000000000'
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
      <div>
        <b>CollectionId:</b>
        {collectionId}
      </div>
      <button
        onClick={() => {
          if (!signer) {
            throw 'Signer not available!'
          }

          getClient().actions.placeBid({
            bids: [
              {
                collection: collectionId,
                weiPrice: price,
              },
            ],
            wallet: adaptEthersSigner(signer),
            onProgress: () => {},
          })
        }}
      >
        Place Bid
      </button>
    </div>
  )
}

export default BidButton
