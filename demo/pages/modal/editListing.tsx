import { NextPage } from 'next'
import { EditListingModal } from '@reservoir0x/reservoir-kit-ui'
import ThemeSwitcher from 'components/ThemeSwitcher'
import { useState, useEffect } from 'react'
import DeeplinkCheckbox from 'components/DeeplinkCheckbox'
import { useRouter } from 'next/router'
import { PrivyConnectButton } from 'components/PrivyConnectButton'
import ChainSwitcher from 'components/ChainSwitcher'

const DEFAULT_COLLECTION_ID =
  process.env.NEXT_PUBLIC_DEFAULT_COLLECTION_ID ||
  '0xe14fa5fba1b55946f2fa78ea3bd20b952fa5f34e'
const DEFAULT_TOKEN_ID = process.env.NEXT_PUBLIC_DEFAULT_TOKEN_ID || '39'
const NORMALIZE_ROYALTIES = process.env.NEXT_PUBLIC_NORMALIZE_ROYALTIES
  ? process.env.NEXT_PUBLIC_NORMALIZE_ROYALTIES === 'true'
  : false

const EditListingPage: NextPage = () => {
  const router = useRouter()
  const deeplinkOpenState = useState(true)
  const hasDeeplink = router.query.deeplink !== undefined
  const [listingId, setListingId] = useState('')
  const [chainId, setChainId] = useState('')
  const [collectionId, setCollectionId] = useState(DEFAULT_COLLECTION_ID)
  const [tokenId, setTokenId] = useState(DEFAULT_TOKEN_ID)
  const [normalizeRoyalties, setNormalizeRoyalties] =
    useState(NORMALIZE_ROYALTIES)

  useEffect(() => {
    const prefilledListingId = router.query.listingId
      ? (router.query.listingId as string)
      : ''
    setListingId(prefilledListingId)
  }, [router.query])

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
      <PrivyConnectButton />
      <div>
        <label>Listing Id: </label>
        <input
          type="text"
          value={listingId}
          onChange={(e) => setListingId(e.target.value)}
          placeholder="Enter a listing id or set a listingId query param"
          style={{ width: 250 }}
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

      <EditListingModal
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
            Edit Listing
          </button>
        }
        openState={hasDeeplink ? deeplinkOpenState : undefined}
        listingId={listingId}
        tokenId={tokenId}
        collectionId={collectionId}
        normalizeRoyalties={normalizeRoyalties}
        onEditListingComplete={(data: any) => {
          console.log('Listing updated', data)
        }}
        onEditListingError={(error: any, data: any) => {
          console.log('Edit Listing Error', error, data)
        }}
        onClose={() => {
          console.log('EditListingModal Closed')
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

export default EditListingPage
