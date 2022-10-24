import { NextPage } from 'next'
import { ListModal } from '@reservoir0x/reservoir-kit-ui'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import ThemeSwitcher from 'components/ThemeSwitcher'
import { useState } from 'react'

const Trigger = ({ children }) => (
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
    }}
  >
    {children}
  </button>
)

const Index: NextPage = () => {
  const [collectionId, setCollectionId] = useState(
    '0xe14fa5fba1b55946f2fa78ea3bd20b952fa5f34e'
  )
  const [tokenId, setTokenId] = useState('39')
  const [nativeOnly, setNativeOnly] = useState(false)
  const [currencies, setCurrencies] = useState([
    { contract: '0x0000000000000000000000000000000000000000', symbol: 'ETH' },
    { contract: '0x2f3A40A3db8a7e3D09B0adfEfbCe4f6F81927557', symbol: 'USDC' },
  ])

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
        <label>Currencies: </label>
        <textarea
          value={JSON.stringify(currencies)}
          onChange={() => {}}
          onBlur={(e) =>
            setCurrencies(e.target.value ? JSON.parse(e.target.value) : null)
          }
        />
      </div>
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

      <ListModal
        trigger={
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              width: '100%',
            }}
          >
            <Trigger>List Item</Trigger>
          </div>
        }
        nativeOnly={nativeOnly}
        collectionId={collectionId}
        tokenId={tokenId}
        currencies={currencies}
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
