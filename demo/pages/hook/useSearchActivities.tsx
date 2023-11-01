import { useSearchActivities } from '@reservoir0x/reservoir-kit-ui'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { NextPage } from 'next'
import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import ChainSwitcher from 'components/ChainSwitcher'

const Activity: NextPage = () => {
  const {
    data: activity,
    fetchNextPage,
    hasNextPage,
  } = useSearchActivities({
    collections: ['0xed5af388653567af2f388e6224dc7c4b3241c544'],
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
      {activity.map((activity, i) => (
        <pre>{JSON.stringify(activity, null, 2)}</pre>
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
      <ChainSwitcher />
    </div>
  )
}

export default Activity
