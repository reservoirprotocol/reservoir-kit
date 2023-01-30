import { NextPage } from 'next'
import { useTokens } from '@reservoir0x/reservoir-kit-ui'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useInView } from 'react-intersection-observer'
import { useEffect } from 'react'

const Tokens: NextPage = () => {
  const {
    data: tokens,
    fetchNextPage,
    hasNextPage,
    isFetchingInitialData,
    isFetchingPage,
    resetCache,
  } = useTokens(
    {
      collection: '0x932ca55b9ef0b3094e8fa82435b3b4c50d713043',
      sortBy: 'floorAskPrice',
      includeTopBid: true,
    },
    {},
    true
  )

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
      <h3 style={{ fontSize: 20, fontWeight: 600 }}>Tokens</h3>
      Fetching Initial: {isFetchingInitialData ? 'Fetching' : '...'}
      <br />
      Fetching: {isFetchingPage ? 'Fetching' : '...'}
      <button
        onClick={() => {
          resetCache()
        }}
      >
        Restart page
      </button>
      {tokens.map((token) => (
        <div key={token?.token?.tokenId}>
          <div>Id: {token?.token?.tokenId}</div>
          <div>Name: {token?.token?.name}</div>
          <div>Price: {token?.market?.floorAsk?.price?.amount?.native}</div>
          <div>Ask Id: {token?.market?.floorAsk?.id}</div>
          <div>Valid From: {token?.market?.floorAsk?.validFrom}</div>
          <div>Valid Until: {token?.market?.floorAsk?.validUntil}</div>
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

export default Tokens
