import { NextPage } from 'next'
import { CancelBidModal } from '@reservoir0x/reservoir-kit-ui'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import ThemeSwitcher from 'components/ThemeSwitcher'
import { useState, useEffect } from 'react'
import DeeplinkCheckbox from 'components/DeeplinkCheckbox'
import { useRouter } from 'next/router'
import ChainSwitcher from 'components/ChainSwitcher'

const NORMALIZE_ROYALTIES = process.env.NEXT_PUBLIC_NORMALIZE_ROYALTIES
  ? process.env.NEXT_PUBLIC_NORMALIZE_ROYALTIES === 'true'
  : false

const CancelBidPage: NextPage = () => {
  const router = useRouter()
  const deeplinkOpenState = useState(true)
  const hasDeeplink = router.query.deeplink !== undefined
  const [bidId, setBidId] = useState('')
  const [chainId, setChainId] = useState('')
  const [normalizeRoyalties, setNormalizeRoyalties] =
    useState(NORMALIZE_ROYALTIES)

  useEffect(() => {
    const prefilledBidId = router.query.bidId
      ? (router.query.bidId as string)
      : ''
    setBidId(prefilledBidId)
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
      <ConnectButton />
      <div>
        <label>Bid Id: </label>
        <input
          type="text"
          value={bidId}
          onChange={(e) => setBidId(e.target.value)}
          placeholder="Enter an bid id or set a bidId query param"
          style={{ width: 250 }}
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

      <CancelBidModal
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
            Cancel Bid
          </button>
        }
        openState={hasDeeplink ? deeplinkOpenState : undefined}
        bidId={bidId}
        normalizeRoyalties={normalizeRoyalties}
        onCancelComplete={(data: any) => {
          console.log('Bid Canceled', data)
        }}
        onCancelError={(error: any, data: any) => {
          console.log('Bid Cancel Error', error, data)
        }}
        onClose={() => {
          console.log('CancelBidModal Closed')
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

export default CancelBidPage
