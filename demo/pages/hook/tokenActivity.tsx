import { useTokenActivity } from '@reservoir0x/reservoir-kit-ui'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { NextPage } from 'next'
import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'

const Activity: NextPage = () => {
  const {
    data: activity,
    fetchNextPage,
    hasNextPage,
  } = useTokenActivity('0x744df993f93c89801cadbea8a4a3fd2b4a443d2c:1793')

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
