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
          BuyModal
        </Link>
        <Link href="/modal/list">
          ListModal
        </Link>
        <Link href="/modal/bid">
          BidModal
        </Link>
        <Link href="/modal/acceptBid">
          AcceptBidModal
        </Link>
        <Link href="/modal/cancelBid">
          CancelBidModal
        </Link>
        <Link href="/modal/cancelListing">
          CancelListingModal
        </Link>
        <Link href="/modal/editBid">
          EditBidModal
        </Link>
        <Link href="/modal/editListing">
          EditListingModal
        </Link>
        <Link href="/modal/mint">
          MintModal
        </Link>
        <Link href="/modal/sweep">
          SweepModal
        </Link>
      </nav>
      <h2>Hooks</h2>
      <nav style={{ display: 'flex', gap: 15 }}>
        <Link href="/hook/collections">
          useCollections
        </Link>
        <Link href="/hook/bids">
          useBids
        </Link>
        <Link href="/hook/collectionActivity">
          useCollectionActivity
        </Link>
        <Link href="/hook/listings">
          useListings
        </Link>
        <Link href="/hook/tokenActivity">
          useTokenActivity
        </Link>
        <Link href="/hook/useSearchActivities">
          useSearchActivities
        </Link>
        <Link href="/hook/tokens">
          useTokens
        </Link>
        <Link href="/hook/useDynamicTokens">
          useDynamicTokens
        </Link>
        <Link href="/hook/userActivity">
          useUserActivity
        </Link>
        <Link href="/hook/userTokens">
          useUserTokens
        </Link>
        <Link href="/hook/userTopBids">
          useUserTopBids
        </Link>
        <Link href="/hook/userCollections">
          useUserCollections
        </Link>
        <Link href="/hook/useTrendingCollections">
          useTrendingCollections
        </Link>
        <Link href="/hook/useTrendingMints">
          useTrendingMints
        </Link>
        <Link href="/hook/useMarketplaceConfigs">
          useMarketplaceConfigs
        </Link>

      </nav>
      <h2>UI Components</h2>
      <nav style={{ display: 'flex', gap: 15 }}>
        <Link href="/ui/tokenMedia">
          TokenMedia
        </Link>
        <Link href="/ui/cart">
          Cart
        </Link>
        <Link href="/ui/collectButton">
          CollectButton
        </Link>
      </nav>
      <h2>SDK Actions</h2>
      <nav style={{ display: 'flex', gap: 15 }}>
        <Link href="/sdk/callAction">
          Call
        </Link>
      </nav>
    </div>
  )
}

export default Index
