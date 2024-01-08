import { NextPage } from 'next'
import { usePrivy } from '@privy-io/react-auth'
import { SweepModal } from '@reservoir0x/reservoir-kit-ui'
import ThemeSwitcher from 'components/ThemeSwitcher'
import { useState } from 'react'
import DeeplinkCheckbox from 'components/DeeplinkCheckbox'
import { useRouter } from 'next/router'
import { PrivyConnectButton } from 'components/PrivyConnectButton'
import ChainSwitcher from 'components/ChainSwitcher'

const DEFAULT_COLLECTION_ID =
  process.env.NEXT_PUBLIC_DEFAULT_COLLECTION_ID ||
  '0xe14fa5fba1b55946f2fa78ea3bd20b952fa5f34e'

const NORMALIZE_ROYALTIES = process.env.NEXT_PUBLIC_NORMALIZE_ROYALTIES
  ? process.env.NEXT_PUBLIC_NORMALIZE_ROYALTIES === 'true'
  : false

const SweepPage: NextPage = () => {
  const router = useRouter()
  const { login } = usePrivy();

  const [contract, setContract] = useState<string | undefined>(undefined)
  const [collectionId, setCollectionId] = useState<string | undefined>(DEFAULT_COLLECTION_ID)
  const [token, setToken] = useState<string | undefined>(undefined)
  const [chainId, setChainId] = useState<string | undefined>(undefined)
  const [feesOnTopBps, setFeesOnTopBps] = useState<string[]>([])
  const [feesOnTopUsd, setFeesOnTopUsd] = useState<string[]>([])
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
      <PrivyConnectButton />

      <div>
        <label>Contract: </label>
        <input
          type="text"
          value={contract}
          onChange={(e) => { 
            if(e.target.value === '') {
              setContract(undefined)
            }
            else {
              setContract(e.target.value)
            } 
          }}
        />
      </div>

      <div>
        <label>CollectionId: </label>
        <input
          type="text"
          value={collectionId}
          onChange={(e) => { 
            if(e.target.value === '') {
              setCollectionId(undefined)
            }
            else {
              setCollectionId(e.target.value)
            } 
          }}
        />
      </div>

      <div>
        <label>Token: </label>
        <input
          type="text"
          value={token}
          onChange={(e) => { 
            if(e.target.value === '') {
              setToken(undefined)
            }
            else {
              setToken(e.target.value)
            } 
          }}
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

      <SweepModal
        chainId={Number(chainId)}
        onConnectWallet={() => {
          login?.()        
        }}
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
        contract={contract}
        collectionId={collectionId}
        token={token}
        feesOnTopBps={feesOnTopBps}
        feesOnTopUsd={feesOnTopUsd}
        openState={hasDeeplink ? deeplinkOpenState : undefined}
        normalizeRoyalties={normalizeRoyalties}
        onSweepComplete={(data) => {
          console.log('Sweep Complete', data)
        }}
        onSweepError={(error, data) => {
          console.log('Sweep Error', error, data)
        }}
        onClose={(data, currentStep) => {
          console.log('SweepModal Closed')
        }}
        onGoToToken={(data) => console.log('Go to Token', data)}
        onPointerDownOutside={(e) => {
          console.log('onPointerDownOutside')
        }}
      />
      <ChainSwitcher/>
      <ThemeSwitcher />
    </div>
  )
}

export default SweepPage
