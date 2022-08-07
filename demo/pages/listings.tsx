import { NextPage } from 'next'
import { useListings } from '@reservoir0x/reservoir-kit-ui'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useInView } from 'react-intersection-observer'
import { useEffect } from 'react'

const Listings: NextPage = () => {
  const { listings, isFetchingPage, fetchNextPage, hasNextPage } = useListings({
    contracts: ['0x81ae0be3a8044772d04f32398bac1e1b4b215aa8'],
  })

  const { ref, inView } = useInView()

  useEffect(() => {
    if (inView) {
      console.log('FETCHING', inView)
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
        <div key={listing.id}>
          <div>Id: {listing.id}</div>
          <div>Price: {listing.price}</div>
          <div>Source: {listing.source.name}</div>
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
    </div>
  )
}

export default Listings
