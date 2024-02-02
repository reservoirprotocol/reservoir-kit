import { NextPage } from 'next'
import { AcceptBidModal } from '@reservoir0x/reservoir-kit-ui'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import ThemeSwitcher from 'components/ThemeSwitcher'
import { useState, useEffect, ComponentPropsWithoutRef } from 'react'
import DeeplinkCheckbox from 'components/DeeplinkCheckbox'
import { useRouter } from 'next/router'
import ChainSwitcher from 'components/ChainSwitcher'
import { formatUnits } from 'viem'

const DEFAULT_COLLECTION_ID =
  process.env.NEXT_PUBLIC_DEFAULT_COLLECTION_ID ||
  '0xe14fa5fba1b55946f2fa78ea3bd20b952fa5f34e'
const DEFAULT_TOKEN_ID = process.env.NEXT_PUBLIC_DEFAULT_TOKEN_ID || '39'
const NORMALIZE_ROYALTIES = process.env.NEXT_PUBLIC_NORMALIZE_ROYALTIES
  ? process.env.NEXT_PUBLIC_NORMALIZE_ROYALTIES === 'true'
  : false

const AcceptBidPage: NextPage = () => {
  const router = useRouter()
  const [collectionId, setCollectionId] = useState(DEFAULT_COLLECTION_ID)
  const [tokenId, setTokenId] = useState(DEFAULT_TOKEN_ID)
  const [chainId, setChainId] = useState('')
  const [swapCurrency, setSwapCurrency] = useState<string>('');
  const deeplinkOpenState = useState(true)
  const hasDeeplink = router.query.deeplink !== undefined
  const [bidId, setBidId] = useState('')
  const [tokens, setTokens] = useState<
    ComponentPropsWithoutRef<typeof AcceptBidModal>['tokens']
  >([])
  const [normalizeRoyalties, setNormalizeRoyalties] =
    useState(NORMALIZE_ROYALTIES)
  const [feesOnTopBps, setFeesOnTopBps] = useState<string[] | undefined>(undefined)

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
      <h3 style={{ marginBottom: 0 }}>Additional Options</h3>
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
      <h3 style={{ marginBottom: 0 }}>Add Tokens</h3>
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
      <div>
        <label>Swap Currency: </label>
        <input
          type="text"
          value={swapCurrency}
          onChange={(e) => setSwapCurrency(e.target.value)}
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
      <button
        disabled={!tokenId.length || !collectionId.length}
        onClick={() => {
          setTokens([
            ...tokens,
            { tokenId: tokenId, collectionId: collectionId, bidIds: [bidId] },
          ])
          setTokenId('')
          setBidId('')
          setCollectionId('')
        }}
      >
        Add Token
      </button>
      <div
        style={{
          marginTop: 10,
          border: '1px solid gray',
          borderRadius: 4,
          padding: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        <b>Tokens Added:</b>
        {tokens.map((token, i) => (
          <div key={i}>
            {token.collectionId}, {token.tokenId}, {token.bidIds}
          </div>
        ))}
      </div>

      <AcceptBidModal
      currency={swapCurrency}
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
            Accept Bid
          </button>
        }
        tokens={tokens}
        openState={hasDeeplink ? deeplinkOpenState : undefined}
        normalizeRoyalties={normalizeRoyalties}
        feesOnTopBps={feesOnTopBps}
        onBidAccepted={(data) => {
          console.log('Bid Accepted', data)
        }}
        onBidAcceptError={(error, data) => {
          console.log('Bid Accept Error', error, data)
        }}
        onCurrentStepUpdate={(data) => {
          console.log('Current Step Updated', data)
        }}
        onClose={() => {
          console.log('AcceptBidModal Closed')
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

export default AcceptBidPage
