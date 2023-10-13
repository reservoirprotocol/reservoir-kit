import { NextPage } from 'next'
import { BuyModal } from '@reservoir0x/reservoir-kit-ui'
import { usePrivy } from '@privy-io/react-auth';
import ThemeSwitcher from 'components/ThemeSwitcher'
import { useState } from 'react'
import DeeplinkCheckbox from 'components/DeeplinkCheckbox'
import { useRouter } from 'next/router'
import { PrivyConnectButton } from 'components/PrivyConnectButton'

const DEFAULT_COLLECTION_ID =
  process.env.NEXT_PUBLIC_DEFAULT_COLLECTION_ID ||
  '0xe14fa5fba1b55946f2fa78ea3bd20b952fa5f34e'
const DEFAULT_TOKEN_ID = process.env.NEXT_PUBLIC_DEFAULT_TOKEN_ID || '39'
const NORMALIZE_ROYALTIES = process.env.NEXT_PUBLIC_NORMALIZE_ROYALTIES
  ? process.env.NEXT_PUBLIC_NORMALIZE_ROYALTIES === 'true'
  : false

const BuyPage: NextPage = () => {
  const router = useRouter()
  const [collectionId, setCollectionId] = useState(DEFAULT_COLLECTION_ID)
  const [tokenId, setTokenId] = useState(DEFAULT_TOKEN_ID)
  const [orderId, setOrderId] = useState('')
  const [chainId, setChainId] = useState<string | number>('')
  const [feesOnTopBps, setFeesOnTopBps] = useState<string[]>([])
  const [feesOnTopUsd, setFeesOnTopUsd] = useState<string[]>([])
  const deeplinkOpenState = useState(true)
  const hasDeeplink = router.query.deeplink !== undefined
  const [normalizeRoyalties, setNormalizeRoyalties] =
    useState(NORMALIZE_ROYALTIES)
  const { login } = usePrivy();

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
        <label>Order Id: </label>
        <input
          type="text"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
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
        <label>Fees on top (USD): </label>
        <textarea
          onChange={() => {}}
          onBlur={(e) => {
            if (e.target.value && e.target.value.length > 0) {
              try {
                setFeesOnTopUsd(JSON.parse(e.target.value))
              } catch (err) {
                e.target.value = ''
                setFeesOnTopUsd([])
              }
            } else {
              e.target.value = ''
              setFeesOnTopUsd([])
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

      <BuyModal
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
            Buy Now
          </button>
        }
        collectionId={collectionId}
        tokenId={tokenId}
        orderId={orderId}
        feesOnTopBps={feesOnTopBps}
        feesOnTopUsd={feesOnTopUsd}
        normalizeRoyalties={normalizeRoyalties}
        openState={hasDeeplink ? deeplinkOpenState : undefined}
        onConnectWallet={() => {
          login?.()
        }}
        onGoToToken={() => console.log('Go to token')}
        onPurchaseComplete={(data) => {
          console.log('Purchase Complete', data)
        }}
        onPurchaseError={(error, data) => {
          console.log('Transaction Error', error, data)
        }}
        onClose={() => {
          console.log('BuyModal Closed')
        }}
      />
      <ThemeSwitcher />
    </div>
  )
}

export default BuyPage
