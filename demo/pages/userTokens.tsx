import { NextPage } from 'next'
import { useUserTokens } from '@reservoir0x/reservoir-kit-ui'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useInView } from 'react-intersection-observer'
import { useEffect } from 'react'

const Tokens: NextPage = () => {
  const {
    data: tokens,
    fetchNextPage,
    hasNextPage,
  } = useUserTokens('0x731b0115fec5b8ee06d98565a7b4b663cad086ba')

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
      {tokens.map((token, i) => (
        <div key={`${token.token.tokenId}-${i}`}>
          <div>Id: {token.token.tokenId}</div>
          <div>Name: {token.token.name}</div>
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
