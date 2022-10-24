import { NextPage } from 'next'
import {
  BuyModal,
  ListModal,
  AcceptBidModal,
  BidModal,
} from '@reservoir0x/reservoir-kit-ui'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import ThemeSwitcher from 'components/ThemeSwitcher'

const Trigger = ({ children }) => (
  <button
    style={{
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
  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        width: '100%',
        gap: 12,
        padding: 24,
        flexDirection: 'column',
        alignItems: 'flex-start',
      }}
    >
      <ConnectButton />
      <BuyModal
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
            <Trigger>Buy Now</Trigger>
          </div>
        }
        collectionId="0xe14fa5fba1b55946f2fa78ea3bd20b952fa5f34e"
        tokenId="39"
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
        nativeOnly={true}
        collectionId="0xe14fa5fba1b55946f2fa78ea3bd20b952fa5f34e"
        tokenId="39"
        currencies={[
          {
            contract: '0x0000000000000000000000000000000000000000',
            symbol: 'ETH',
          },
          {
            contract: '0x2f3A40A3db8a7e3D09B0adfEfbCe4f6F81927557',
            symbol: 'USDC',
          },
        ]}
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

      <BidModal
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
            <Trigger>Place Bid</Trigger>
          </div>
        }
        collectionId="0x2f727bf6805bac340191a8f5102524b78d868233"
        onBidComplete={(data) => {
          console.log('Bid Complete', data)
        }}
        onBidError={(error, data) => {
          console.log('Bid Transaction Error', error, data)
        }}
        onClose={() => {
          console.log('BidModal Closed')
        }}
      />

      <AcceptBidModal
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
            <Trigger>Accept Bid</Trigger>
          </div>
        }
        collectionId="0x2f727bf6805bac340191a8f5102524b78d868233"
        tokenId="420"
        onBidAccepted={(data) => {
          console.log('Bid Accepted', data)
        }}
        onBidAcceptError={(error, data) => {
          console.log('Bid Acceptance Error', error, data)
        }}
        onClose={() => {
          console.log('AcceptBidModal Closed')
        }}
      />

      <ThemeSwitcher />
    </div>
  )
}

export default Index
