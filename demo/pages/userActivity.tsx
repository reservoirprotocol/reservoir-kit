import { NextPage } from 'next'
import { useUsersActivity } from '@reservoir0x/reservoir-kit-ui'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useInView } from 'react-intersection-observer'
import { useEffect } from 'react'

const UserActivity: NextPage = () => {
  const {
    data: activity,
    fetchNextPage,
    hasNextPage,
  } = useUsersActivity(['0xFd03726FD90ccc7386bf62b44Bb594f7cbFB3995'], {
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

export default UserActivity
