import { NextPage } from 'next'
import { CollectModal, CollectModalMode } from '@reservoir0x/reservoir-kit-ui'
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

const CollectPage: NextPage = () => {
  const router = useRouter()
  const [collectionId, setCollectionId] = useState(DEFAULT_COLLECTION_ID)
  const [tokenId, setTokenId] = useState<string | undefined>(undefined)
  const [mode, setMode] = useState('preferMint')
  const [feesOnTopBps, setFeesOnTopBps] = useState<string[]>([])
  const [feesOnTop, setFeesOnTop] = useState<string[]>([])
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

      <div style={{ display: 'flex', gap: 10 }}>
        <label>Mode: </label>
        <div style={{ display: 'flex', gap: 10 }}>
          <div>
            <input
              type="radio"
              value="preferMint"
              checked={mode === 'preferMint'}
              onChange={() => setMode('preferMint')}
            />
            <label>preferMint</label>
          </div>
          <div>
            <input
              type="radio"
              value="mint"
              checked={mode === 'mint'}
              onChange={() => setMode('mint')}
            />
            <label>mint</label>
          </div>
          <div>
            <input
              type="radio"
              value="trade"
              checked={mode === 'trade'}
              onChange={() => setMode('trade')}
            />
            <label>trade</label>
          </div>
        </div>
      </div>

      <div>
        <label>Fees on top (BPS): </label>
        <textarea
          onChange={() => {}}
          onBlur={(e) => {
            if (e.target.value && e.target.value.length > 0) {
              try {
                setFeesOnTopBps(JSON.parse(e.target.value))
              } catch (err) {
                e.target.value = ''
                setFeesOnTopBps([])
              }
            } else {
              e.target.value = ''
              setFeesOnTopBps([])
            }
          }}
        />
      </div>
      <div>
        <label>Fees on top (Flat): </label>
        <textarea
          onChange={() => {}}
          onBlur={(e) => {
            if (e.target.value && e.target.value.length > 0) {
              try {
                setFeesOnTop(JSON.parse(e.target.value))
              } catch (err) {
                e.target.value = ''
                setFeesOnTop([])
              }
            } else {
              e.target.value = ''
              setFeesOnTop([])
            }
          }}
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

      <CollectModal
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
            Collect
          </button>
        }
        collectionId={collectionId}
        tokenId={tokenId}
        mode={mode as CollectModalMode}
        feesOnTopBps={feesOnTopBps}
        feesOnTopFixed={feesOnTop}
        openState={hasDeeplink ? deeplinkOpenState : undefined}
        normalizeRoyalties={normalizeRoyalties}
        onCollectComplete={(data) => {
          console.log('Collect Complete', data)
        }}
        onCollectError={(error, data) => {
          console.log('Collect Error', error, data)
        }}
        onClose={(data, currentStep) => {
          console.log('CollectModal Closed')
        }}
      />
      <ThemeSwitcher />
    </div>
  )
}

export default CollectPage
