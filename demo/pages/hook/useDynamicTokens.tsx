import { NextPage } from 'next'
import { useDynamicTokens } from '@reservoir0x/reservoir-kit-ui'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useInView } from 'react-intersection-observer'
import { useEffect, useState } from 'react'
import ChainSwitcher from 'components/ChainSwitcher'

const Tokens: NextPage = () => {
  const [collectionId, setCollectionId] = useState('0xf5de760f2e916647fd766b4ad9e85ff943ce3a2b')
  const [search, setSearch] = useState<string | undefined>(undefined)

  const {
    data: tokens,
    fetchNextPage,
    hasNextPage,
    isFetchingInitialData,
    isFetchingPage,
    resetCache,
  } = useDynamicTokens({
    collection: collectionId,
    tokenName: search ? search : undefined
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
      <div>
        <label>Collection Id: </label>
        <input
          type="text"
          value={collectionId}
          onChange={(e) => setCollectionId(e.target.value)}
        />
      </div>
      <div>
        <label>Search term: </label>
        <input
          type="text"
          value={search}
          onChange={(e) => { 
            resetCache()
            setSearch(e.target.value)
           }}
        />
      </div>
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
          {token?.token?.image ? <img src={token?.token?.image} style={{ width: 100, height: 100 }}/>  : null}
          <div>Name: {token?.token?.name}</div>
          <div>Price: {token?.market?.floorAsk?.price?.amount?.native}</div>
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

export default Tokens
