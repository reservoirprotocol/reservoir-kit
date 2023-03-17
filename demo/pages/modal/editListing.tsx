import { NextPage } from 'next'
import { EditListingModal } from '@reservoir0x/reservoir-kit-ui'
import { ConnectKitButton } from 'connectkit'
import ThemeSwitcher from 'components/ThemeSwitcher'
import { useState, useEffect } from 'react'
import DeeplinkCheckbox from 'components/DeeplinkCheckbox'
import { useRouter } from 'next/router'

const NORMALIZE_ROYALTIES = process.env.NEXT_PUBLIC_NORMALIZE_ROYALTIES
  ? process.env.NEXT_PUBLIC_NORMALIZE_ROYALTIES === 'true'
  : false

const EditListingPage: NextPage = () => {
  const router = useRouter()
  const deeplinkOpenState = useState(true)
  const hasDeeplink = router.query.deeplink !== undefined
  const [listingId, setListingId] = useState('')
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
      <ConnectKitButton />
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
        normalizeRoyalties={normalizeRoyalties}
        onCancelComplete={(data: any) => {
          console.log('Listing updated', data)
        }}
        onCancelError={(error: any, data: any) => {
          console.log('Edit Listing Error', error, data)
        }}
        onClose={() => {
          console.log('EditListingModal Closed')
        }}
      />
      <ThemeSwitcher />
    </div>
  )
}

export default EditListingPage
