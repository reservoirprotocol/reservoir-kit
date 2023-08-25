import { NextPage } from 'next'
import { ListModal } from '@reservoir0x/reservoir-kit-ui'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import ThemeSwitcher from 'components/ThemeSwitcher'
import { useState } from 'react'
import DeeplinkCheckbox from 'components/DeeplinkCheckbox'
import { useRouter } from 'next/router'

const DEFAULT_COLLECTION_ID =
  process.env.NEXT_PUBLIC_DEFAULT_COLLECTION_ID ||
  '0xe14fa5fba1b55946f2fa78ea3bd20b952fa5f34e'
const DEFAULT_TOKEN_ID = process.env.NEXT_PUBLIC_DEFAULT_TOKEN_ID || '39'
const NORMALIZE_ROYALTIES = process.env.NEXT_PUBLIC_NORMALIZE_ROYALTIES
  ? process.env.NEXT_PUBLIC_NORMALIZE_ROYALTIES === 'true'
  : false
const chainId: number = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 1)

let mainnetSymbol = 'ETH'

switch (chainId) {
  case 1:
  case 5: {
    mainnetSymbol = 'ETH'
    break
  }
  case 137: {
    mainnetSymbol = 'MATIC'
    break
  }
}

const Index: NextPage = () => {
  const router = useRouter()
  const [collectionId, setCollectionId] = useState(DEFAULT_COLLECTION_ID)
  const [tokenId, setTokenId] = useState(DEFAULT_TOKEN_ID)
  const [chainId, setChainId] = useState('')
  const [currencies, setCurrencies] = useState<
    { contract: string; symbol: string; decimals?: number }[] | undefined
  >([
    {
      contract: '0x0000000000000000000000000000000000000000',
      symbol: mainnetSymbol,
    },
    {
      contract: '0x2f3A40A3db8a7e3D09B0adfEfbCe4f6F81927557',
      symbol: 'USDC',
      decimals: 6,
    },
  ])
  const deeplinkOpenState = useState(true)
  const hasDeeplink = router.query.deeplink !== undefined
  const [nativeOnly, setNativeOnly] = useState(false)
  const [normalizeRoyalties, setNormalizeRoyalties] =
    useState(NORMALIZE_ROYALTIES)
  const [enableOnChainRoyalties, setEnableOnChainRoyalties] = useState(false)
  const [oracleEnabled, setOracleEnabled] = useState(false)
  const [feesBps, setFeesBps] = useState<string[] | undefined>()

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
        <label>Chain Override: </label>
        <input
          type="text"
          value={chainId}
          onChange={(e) => setChainId(e.target.value)}
        />
      <div>
        <label>Currencies: </label>
        <textarea
          onChange={() => {}}
          defaultValue={JSON.stringify(currencies)}
          onFocus={(e) => {
            e.target.value = JSON.stringify(currencies)
          }}
          onBlur={(e) => {
            if (e.target.value && e.target.value.length > 0) {
              try {
                setCurrencies(JSON.parse(e.target.value))
              } catch (e) {
                setCurrencies(undefined)
              }
            } else {
              setCurrencies(undefined)
            }
          }}
        />
      </div>
      <div>
        <label>Fees (BPS):</label>
        <textarea
          onChange={() => {}}
          onBlur={(e) => {
            if (e.target.value && e.target.value.length > 0) {
              try {
                setFeesBps(JSON.parse(e.target.value))
              } catch (err) {
                e.target.value = ''
                setFeesBps(undefined)
              }
            } else {
              e.target.value = ''
              setFeesBps(undefined)
            }
          }}
        />
      </div>
      <DeeplinkCheckbox />
      <div>
        <label>Native Only: </label>
        <input
          type="checkbox"
          checked={nativeOnly}
          onChange={(e) => {
            setNativeOnly(e.target.checked)
          }}
        />
      </div>
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
      <div>
        <label>Enable On Chain Royalties: </label>
        <input
          type="checkbox"
          checked={enableOnChainRoyalties}
          onChange={(e) => {
            setEnableOnChainRoyalties(e.target.checked)
          }}
        />
      </div>
      <div>
        <label>Oracle Enabled: </label>
        <input
          type="checkbox"
          checked={oracleEnabled}
          onChange={(e) => {
            setOracleEnabled(e.target.checked)
          }}
        />
      </div>

      <ListModal
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
            List Item
          </button>
        }
        nativeOnly={nativeOnly}
        collectionId={collectionId}
        tokenId={tokenId}
        currencies={currencies}
        normalizeRoyalties={normalizeRoyalties}
        enableOnChainRoyalties={enableOnChainRoyalties}
        oracleEnabled={oracleEnabled}
        openState={hasDeeplink ? deeplinkOpenState : undefined}
        feesBps={feesBps}
        onGoToToken={() => console.log('Awesome!')}
        onListingComplete={(data) => {
          console.log('Listing Complete', data)
        }}
        onListingError={(error, data) => {
          console.log('Transaction Error', error, data)
        }}
        onClose={() => {
          console.log('ListModal Closed')
        }}
      />
      <ThemeSwitcher />
    </div>
  )
}

export default Index
