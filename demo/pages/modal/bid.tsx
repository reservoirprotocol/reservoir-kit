import { NextPage } from 'next'
import { BidModal } from '@reservoir0x/reservoir-kit-ui'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import ThemeSwitcher from 'components/ThemeSwitcher'
import { ComponentPropsWithoutRef, useState } from 'react'
import DeeplinkCheckbox from 'components/DeeplinkCheckbox'
import { useRouter } from 'next/router'

const DEFAULT_COLLECTION_ID =
  process.env.NEXT_PUBLIC_DEFAULT_COLLECTION_ID ||
  '0xe14fa5fba1b55946f2fa78ea3bd20b952fa5f34e'
const DEFAULT_TOKEN_ID = process.env.NEXT_PUBLIC_DEFAULT_TOKEN_ID || '39'
const NORMALIZE_ROYALTIES = process.env.NEXT_PUBLIC_NORMALIZE_ROYALTIES
  ? process.env.NEXT_PUBLIC_NORMALIZE_ROYALTIES === 'true'
  : false

const BidPage: NextPage = () => {
  const router = useRouter()
  const [collectionId, setCollectionId] = useState(DEFAULT_COLLECTION_ID)
  const [tokenId, setTokenId] = useState(DEFAULT_TOKEN_ID)
  const [attributeKey, setAttributeKey] = useState('')
  const [attributeValue, setAttributeValue] = useState('')
  const [attribute, setAttribute] =
    useState<ComponentPropsWithoutRef<typeof BidModal>['attribute']>(undefined)
  const deeplinkOpenState = useState(true)
  const hasDeeplink = router.query.deeplink !== undefined
  const [normalizeRoyalties, setNormalizeRoyalties] =
    useState(NORMALIZE_ROYALTIES)

  const computeAttribute = () => {
    {
      if (attributeKey.length > 0 && attributeValue.length > 0) {
        setAttribute({
          key: attributeKey,
          value: attributeValue,
        })
      } else {
        setAttribute(undefined)
      }
    }
  }

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
        <label>Attribute Key: </label>
        <input
          type="text"
          value={attributeKey}
          onChange={(e) => setAttributeKey(e.target.value)}
          onBlur={computeAttribute}
        />
      </div>
      <div>
        <label>Attribute Value: </label>
        <input
          type="text"
          value={attributeValue}
          onChange={(e) => setAttributeValue(e.target.value)}
          onBlur={computeAttribute}
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

      <BidModal
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
            Place Bid
          </button>
        }
        collectionId={collectionId}
        tokenId={tokenId}
        attribute={attribute}
        normalizeRoyalties={normalizeRoyalties}
        openState={hasDeeplink ? deeplinkOpenState : undefined}
        onBidComplete={(data) => {
          console.log('Bid Complete', data)
        }}
        onBidError={(error, data) => {
          console.log('Bid Transaction Error', error, data)
        }}
        onClose={() => {
          console.log('BidModal Closed')
        }}
        onViewOffers={() => {
          console.log('On View offers clicked')
        }}
      />
      <ThemeSwitcher />
    </div>
  )
}

export default BidPage
