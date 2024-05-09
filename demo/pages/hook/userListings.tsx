import { NextPage } from 'next'
import { useUserListings } from '@reservoir0x/reservoir-kit-ui'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useInView } from 'react-intersection-observer'
import { useEffect } from 'react'
import ChainSwitcher from 'components/ChainSwitcher'

const UserListings: NextPage = () => {
  const {
    data: listings,
    fetchNextPage,
    hasNextPage,
  } = useUserListings({
    limit: 20,
  })

  const { ref, inView } = useInView()

  useEffect(() => {
    if (inView) {
      fetchNextPage()
    }
  }, [inView])

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
      <h3 style={{ fontSize: 20, fontWeight: 600 }}>Listings</h3>
      {listings.map((listing) => (
        <div key={listing?.id}>
          <div>Id: {listing?.id}</div>
          <div>Price: {listing?.price?.amount?.native}</div>
          <div>Source: {listing?.source?.name as string}</div>
        </div>
      ))}
      {hasNextPage ? (
        <div
          style={{
            fontWeight: 600,
            fontSize: 16,
            padding: 10,
            width: '100%',
            flexShrink: 0,
          }}
          ref={ref}
        >
          Loading
        </div>
      ) : (
        <div>No more data</div>
      )}
      <ChainSwitcher style={{ right: 16 }} />
    </div>
  )
}

export default UserListings
