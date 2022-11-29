import { NextPage } from 'next'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import ThemeSwitcher from 'components/ThemeSwitcher'
import Link from 'next/link'

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
      <ThemeSwitcher />

      <h2>Modals</h2>
      <nav style={{ display: 'flex', gap: 15 }}>
        <Link href="/modal/buy">
          <a>BuyModal</a>
        </Link>
        <Link href="/modal/list">
          <a>ListModal</a>
        </Link>
        <Link href="/modal/bid">
          <a>BidModal</a>
        </Link>
        <Link href="/modal/acceptBid">
          <a>AcceptBidModal</a>
        </Link>
      </nav>
      <h2>Hooks</h2>
      <nav style={{ display: 'flex', gap: 15 }}>
        <Link href="/hook/bids">
          <a>useBids</a>
        </Link>
        <Link href="/hook/collectionActivity">
          <a>useCollectionActivity</a>
        </Link>
        <Link href="/hook/listings">
          <a>useListings</a>
        </Link>
        <Link href="/hook/tokens">
          <a>useTokens</a>
        </Link>
        <Link href="/hook/userActivity">
          <a>useUserActivity</a>
        </Link>
        <Link href="/hook/userTokens">
          <a>useUserTokens</a>
        </Link>
        <Link href="/hook/userTopBids">
          <a>useUserTopBids</a>
        </Link>
      </nav>
      <h2>UI Components</h2>
      <nav style={{ display: 'flex', gap: 15 }}>
        <Link href="/ui/tokenMedia">
          <a>TokenMedia</a>
        </Link>
      </nav>
    </div>
  )
}

export default Index
