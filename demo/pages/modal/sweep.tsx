import { NextPage } from 'next'
import { SweepAttributes, SweepModal } from '@reservoir0x/reservoir-kit-ui'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import ThemeSwitcher from 'components/ThemeSwitcher'
import { useState } from 'react'
import DeeplinkCheckbox from 'components/DeeplinkCheckbox'
import { useRouter } from 'next/router'

const DEFAULT_COLLECTION_ID =
  process.env.NEXT_PUBLIC_DEFAULT_COLLECTION_ID ||
  '0xe14fa5fba1b55946f2fa78ea3bd20b952fa5f34e'
const NORMALIZE_ROYALTIES = process.env.NEXT_PUBLIC_NORMALIZE_ROYALTIES
  ? process.env.NEXT_PUBLIC_NORMALIZE_ROYALTIES === 'true'
  : false

const SweepPage: NextPage = () => {
  const router = useRouter()
  const [collectionId, setCollectionId] = useState(DEFAULT_COLLECTION_ID)
  const [attributes, setAttributes] = useState<SweepAttributes>()
  const [referrer, setReferrer] = useState<string | undefined>(undefined)
  const [referrerBps, setReferrerBps] = useState<number | undefined>(undefined)
  const [referrerFee, setReferrerFee] = useState<number | undefined>(undefined)
  const deeplinkOpenState = useState(true)
  const hasDeeplink = router.query.deeplink !== undefined
  const [normalizeRoyalties, setNormalizeRoyalties] =
    useState(NORMALIZE_ROYALTIES)

  console.log('sweep attributes: ', attributes)
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
        <label>Attributes: </label>
        <textarea
          onChange={() => {}}
          placeholder={`{"attributes[Background]": "M1 Yellow"}`}
          defaultValue={JSON.stringify(attributes)}
          onFocus={(e) => {
            e.target.value = JSON.stringify(attributes)
          }}
          onBlur={(e) => {
            if (e.target.value && e.target.value.length > 0) {
              console.log(e.target.value)
              console.log(JSON.parse(e.target.value))
              try {
                setAttributes(JSON.parse(e.target.value))
              } catch (e) {
                setAttributes(undefined)
              }
            } else {
              setAttributes(undefined)
            }
          }}
        />
      </div>
      <div>
        <label>Referrer: </label>
        <input
          type="text"
          value={referrer}
          onChange={(e) => setReferrer(e.target.value)}
        />
      </div>
      <div>
        <label>Referrer BPS: </label>
        <input
          type="number"
          value={referrerBps}
          onChange={(e) =>
            setReferrerBps(e.target.value ? +e.target.value : undefined)
          }
        />
      </div>
      <div>
        <label>Referrer Fee (Flat): </label>
        <input
          type="number"
          value={referrerFee}
          onChange={(e) =>
            setReferrerFee(e.target.value ? +e.target.value : undefined)
          }
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

      <SweepModal
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
            Sweep
          </button>
        }
        collectionId={collectionId}
        attributes={attributes}
        referrer={referrer}
        referrerFeeBps={referrerBps}
        referrerFeeFixed={referrerFee}
        openState={hasDeeplink ? deeplinkOpenState : undefined}
        normalizeRoyalties={normalizeRoyalties}
        onSweepComplete={(data) => {
          console.log('Sweep Complete', data)
        }}
        onSweepError={(error, data) => {
          console.log('Sweep Error', error, data)
        }}
        onClose={() => {
          console.log('SweepModal Closed')
        }}
      />
      <ThemeSwitcher />
    </div>
  )
}

export default SweepPage
