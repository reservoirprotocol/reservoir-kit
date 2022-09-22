import { useContext } from 'react'
import { NextPage } from 'next'
import {
  BuyModal,
  ListModal,
  AcceptBidModal,
  BidModal,
  darkTheme,
  lightTheme,
} from '@reservoir0x/reservoir-kit-ui'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { ThemeSwitcherContext } from './_app'

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

const getThemeFromOption = (option: string) => {
  switch (option) {
    case 'light': {
      return lightTheme({
        ethIcon: 'glyph',
      })
    }

    case 'dark': {
      return darkTheme()
    }

    case 'decent': {
      return lightTheme({
        font: 'ABC Monument Grotesk',
        primaryColor: 'black',
        primaryHoverColor: 'rgb(153 105 255)',
        headerBackground: 'rgb(246, 234, 229)',
        contentBackground: '#fbf3f0',
        footerBackground: 'rgb(246, 234, 229)',
        textColor: 'rgb(55, 65, 81)',
        borderColor: 'rgba(0,0,0, 0)',
        overlayBackground: 'rgba(31, 41, 55, 0.75)',
      })
    }

    case 'reservoir': {
      return lightTheme({
        font: 'Inter',
        primaryColor: '#7000FF',
      })
    }

    default: {
      return darkTheme()
    }
  }
}

const Index: NextPage = () => {
  const { setTheme } = useContext(ThemeSwitcherContext)

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
        collectionId="0xf5de760f2e916647fd766b4ad9e85ff943ce3a2b"
        tokenId="960982"
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
        collectionId="0x2ef35e14695736e64d967edb064d2120edbc8af7"
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
        collectionId="0x4d68e14cd7dec510c84326f54ee41f88e8fad59b"
        tokenId="23423"
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

      <select
        onClick={(e) => {
          e.stopPropagation()
        }}
        onChange={(e) => {
          setTheme(getThemeFromOption(e.target.value))
        }}
        style={{ position: 'fixed', top: 16, right: 16 }}
      >
        <option value="dark">Dark Theme</option>
        <option value="light">Light Theme</option>
        <option value="decent">Decent</option>
        <option value="reservoir">Reservoir</option>
      </select>
    </div>
  )
}

export default Index
