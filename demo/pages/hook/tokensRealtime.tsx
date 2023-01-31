import { NextPage } from 'next'
import { TokenMedia, useTokens } from '@reservoir0x/reservoir-kit-ui'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useInView } from 'react-intersection-observer'
import { useEffect, useState } from 'react'

const DEFAULT_COLLECTION_ID =
  process.env.NEXT_PUBLIC_DEFAULT_COLLECTION_ID ||
  '0x34d85c9cdeb23fa97cb08333b511ac86e1c4e258'

const Tokens: NextPage = () => {
  const [collectionId, setCollectionId] = useState(DEFAULT_COLLECTION_ID)

  const {
    data: tokens,
    fetchNextPage,
    hasNextPage,
    isFetchingInitialData,
    isFetchingPage,
    resetCache,
  } = useTokens(
    {
      collection: collectionId || DEFAULT_COLLECTION_ID,
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
        boxSizing: 'border-box',
      }}
    >
      <ConnectButton />
      <h3 style={{ fontSize: 20, fontWeight: 600 }}>Tokens</h3>
      <div>
        <label>Collection Id: </label>
        <input
          placeholder="Collection Id"
          type="text"
          value={collectionId}
          onChange={(e) => setCollectionId(e.target.value)}
          style={{ width: 250 }}
        />
      </div>
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
      <div
        style={{
          display: 'grid',
          width: '100%',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 14,
          boxSizing: 'border-box',
          maxWidth: '100%',
        }}
      >
        {tokens.map((token, i) => {
          if (token)
            return (
              <div
                style={{
                  backgroundColor: '#202425',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <TokenMedia
                  key={i}
                  token={token?.token}
                  style={{
                    width: '100%',
                    height: '100%',
                    aspectRatio: '1/1',
                  }}
                  onRefreshToken={() => {
                    window.alert('Token was refreshed!')
                  }}
                />
                <div
                  style={{ padding: '10px 10px 20px 10px', overflow: 'hidden' }}
                >
                  <div style={{ textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    Token Id: {token?.token?.tokenId}
                  </div>
                  <div>
                    Price: {token?.market?.floorAsk?.price?.amount?.native}
                  </div>
                </div>
              </div>
            )
        })}
      </div>
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
