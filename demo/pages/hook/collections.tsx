import { NextPage } from 'next'
import { useCollections } from '@reservoir0x/reservoir-kit-ui'
import { useInView } from 'react-intersection-observer'
import { useEffect } from 'react'
import { PrivyConnectButton } from 'components/PrivyConnectButton'
import ChainSwitcher from 'components/ChainSwitcher'

const Collections: NextPage = () => {
  const { data: collections, fetchNextPage, hasNextPage } = useCollections({})

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
      <PrivyConnectButton />
      <h3 style={{ fontSize: 20, fontWeight: 600 }}>Collections</h3>
      {collections.map((collection, i) => (
        <pre>{JSON.stringify(collection, null, 2)}</pre>
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

export default Collections
