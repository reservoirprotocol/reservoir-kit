import { NextPage } from 'next'
import { EditBidModal } from '@reservoir0x/reservoir-kit-ui'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import ThemeSwitcher from 'components/ThemeSwitcher'
import { useState } from 'react'
import DeeplinkCheckbox from 'components/DeeplinkCheckbox'
import { useRouter } from 'next/router'
import ChainSwitcher from 'components/ChainSwitcher'

const DEFAULT_COLLECTION_ID =
  process.env.NEXT_PUBLIC_DEFAULT_COLLECTION_ID ||
  '0xe14fa5fba1b55946f2fa78ea3bd20b952fa5f34e'
const DEFAULT_TOKEN_ID = process.env.NEXT_PUBLIC_DEFAULT_TOKEN_ID || '39'
const NORMALIZE_ROYALTIES = process.env.NEXT_PUBLIC_NORMALIZE_ROYALTIES
  ? process.env.NEXT_PUBLIC_NORMALIZE_ROYALTIES === 'true'
  : false

const EditBidPage: NextPage = () => {
  const router = useRouter()
  const [bidId, setBidId] = useState('')
  const [collectionId, setCollectionId] = useState(DEFAULT_COLLECTION_ID)
  const [tokenId, setTokenId] = useState(DEFAULT_TOKEN_ID)
  const [chainId, setChainId] = useState('')
  const deeplinkOpenState = useState(true)
  const hasDeeplink = router.query.deeplink !== undefined
  const [normalizeRoyalties, setNormalizeRoyalties] =
    useState(NORMALIZE_ROYALTIES)

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
        <label>Bid Id: </label>
        <input
          type="text"
          value={bidId}
          onChange={(e) => setBidId(e.target.value)}
        />
      </div>
      <div>
        <label>Collection Id: </label>
        <input
          type="text"
          value={collectionId}
          onChange={(e) => setCollectionId(e.target.value)}
        />
      </div>
      <div>
        <label>Token Id: </label>
        <input
          type="text"
          value={tokenId}
          onChange={(e) => setTokenId(e.target.value)}
        />
      </div>
      <div>
        <label>Chain Override: </label>
        <input
          type="text"
          value={chainId}
          onChange={(e) => setChainId(e.target.value)}
        />
      </div>
      <DeeplinkCheckbox />
      <div>
        <label>Normalize Royalties: </label>
        <input
          type="checkbox"
          checked={normalizeRoyalties}
          onChange={(e) => {
            setNormalizeRoyalties(e.target.checked)
          }}
        />
      </div>

      <EditBidModal
        chainId={Number(chainId)}
        trigger={
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
          >
            Edit Bid
          </button>
        }
        bidId={bidId}
        collectionId={collectionId}
        tokenId={tokenId}
        normalizeRoyalties={normalizeRoyalties}
        openState={hasDeeplink ? deeplinkOpenState : undefined}
        onEditBidComplete={(data) => {
          console.log('EditBid Complete', data)
        }}
        onEditBidError={(error, data) => {
          console.log('EditBid Transaction Error', error, data)
        }}
        onClose={() => {
          console.log('EditBidModal Closed')
        }}
        onPointerDownOutside={(e) => {
          console.log('onPointerDownOutside')
        }}
      />
      <ChainSwitcher />
      <ThemeSwitcher />
    </div>
  )
}

export default EditBidPage
