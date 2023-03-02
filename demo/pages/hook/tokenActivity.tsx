import { NextPage } from 'next'
import {
  useCollectionActivity,
  useTokenActivity,
} from '@reservoir0x/reservoir-kit-ui'
import { ConnectKitButton } from 'connectkit'
import { useInView } from 'react-intersection-observer'
import { useEffect } from 'react'

const Activity: NextPage = () => {
  const { data: test } = useCollectionActivity({
    collection: '0xf5de760f2e916647fd766b4ad9e85ff943ce3a2b:1271',
  })

  const {
    data: activity,
    fetchNextPage,
    hasNextPage,
  } = useTokenActivity('0xf5de760f2e916647fd766b4ad9e85ff943ce3a2b:1271', {})

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
      <ConnectKitButton />
      <h3 style={{ fontSize: 20, fontWeight: 600 }}>Activity</h3>
      {activity.map((token, i) => (
        <pre>{JSON.stringify(token, null, 2)}</pre>
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

export default Activity
