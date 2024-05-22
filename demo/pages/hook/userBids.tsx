import { NextPage } from 'next'
import { useUserBids } from '@reservoir0x/reservoir-kit-ui'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useInView } from 'react-intersection-observer'
import { useEffect } from 'react'
import ChainSwitcher from 'components/ChainSwitcher'
import { useAccount } from 'wagmi'

const UserBids: NextPage = () => {
  const { address } = useAccount()
  const {
    data: bids,
    fetchNextPage,
    hasNextPage,
  } = useUserBids(address, {
    limit: 10,
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
      <h3 style={{ fontSize: 20, fontWeight: 600 }}>Bids</h3>
      {bids.map((bid) => (
        <div key={bid?.id}>
          <div>Id: {bid?.id}</div>
          <div>Price: {bid?.price?.amount?.native}</div>
          <div>Source: {bid?.source?.name as string}</div>
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

export default UserBids
