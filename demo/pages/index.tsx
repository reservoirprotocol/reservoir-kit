import { NextPage } from 'next'
import ThemeSwitcher from 'components/ThemeSwitcher'
import Link from 'next/link'
import { PrivyConnectButton } from 'components/PrivyConnectButton'
import ChainSwitcher from 'components/ChainSwitcher'

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
      <PrivyConnectButton />
      <ThemeSwitcher />
      <ChainSwitcher/>

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
        <Link href="/modal/cancelBid">
          <a>CancelBidModal</a>
        </Link>
        <Link href="/modal/cancelListing">
          <a>CancelListingModal</a>
        </Link>
        <Link href="/modal/editBid">
          <a>EditBidModal</a>
        </Link>
        <Link href="/modal/editListing">
          <a>EditListingModal</a>
        </Link>
        <Link href="/modal/mint">
          <a>MintModal</a>
        </Link>
        <Link href="/modal/sweep">
          <a>SweepModal</a>
        </Link>
      </nav>
      <h2>Hooks</h2>
      <nav style={{ display: 'flex', gap: 15 }}>
        <Link href="/hook/collections">
          <a>useCollections</a>
        </Link>
        <Link href="/hook/bids">
          <a>useBids</a>
        </Link>
        <Link href="/hook/collectionActivity">
          <a>useCollectionActivity</a>
        </Link>
        <Link href="/hook/listings">
          <a>useListings</a>
        </Link>
        <Link href="/hook/tokenActivity">
          <a>useTokenActivity</a>
        </Link>
        <Link href="/hook/useSearchActivities">
          <a>useSearchActivities</a>
        </Link>
        <Link href="/hook/tokens">
          <a>useTokens</a>
        </Link>
        <Link href="/hook/useDynamicTokens">
          <a>useDynamicTokens</a>
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
        <Link href="/hook/userCollections">
          <a>useUserCollections</a>
        </Link>
        <Link href="/hook/useTrendingCollections">
          <a>useTrendingCollections</a>
        </Link>
        <Link href="/hook/useTrendingMints">
          <a>useTrendingMints</a>
        </Link>
        <Link href="/hook/useMarketplaceConfigs">
          <a>useMarketplaceConfigs</a>
        </Link>

      </nav>
      <h2>UI Components</h2>
      <nav style={{ display: 'flex', gap: 15 }}>
        <Link href="/ui/tokenMedia">
          <a>TokenMedia</a>
        </Link>
        <Link href="/ui/cart">
          <a>Cart</a>
        </Link>
        <Link href="/ui/collectButton">
          <a>CollectButton</a>
        </Link>
      </nav>
      <h2>SDK Actions</h2>
      <nav style={{ display: 'flex', gap: 15 }}>
        <Link href="/sdk/callAction">
          <a>Call</a>
        </Link>
      </nav>
    </div>
  )
}

export default Index
