import { NextPage } from 'next'
import { useUserTopBids } from '@reservoir0x/reservoir-kit-ui'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useInView } from 'react-intersection-observer'
import { createRef, useEffect, useState } from 'react'
import { useAccount } from 'wagmi'

const UserTopBids: NextPage = () => {
  const { address: userAddress } = useAccount()
  const addressInput = createRef<HTMLInputElement | undefined>()
  const queryTextarea = createRef<HTMLTextAreaElement | undefined>()
  const [address, setAddress] = useState<string | undefined>()
  const [queryParams, setQueryParams] = useState<Record<any, any>>({})
  const {
    data: bids,
    fetchNextPage,
    hasNextPage,
  } = useUserTopBids(address, {
    ...queryParams,
  })

  const { ref, inView } = useInView()

  useEffect(() => {
    if (inView) {
      fetchNextPage()
    }
  }, [inView])

  useEffect(() => {
    if (!address || address.length === 0) {
      setAddress(userAddress)
      addressInput.current.value = userAddress
    }
  }, [userAddress])

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
        <label>User: </label>
        <input type="text" ref={addressInput} />
      </div>
      <div>
        <label>Query Params: </label>
        <textarea ref={queryTextarea} />
      </div>
      <button
        onClick={() => {
          setAddress(addressInput.current?.value || '')
          try {
            if (
              queryTextarea.current.value &&
              queryTextarea.current.value.length > 0
            ) {
              setQueryParams(JSON.parse(queryTextarea.current.value))
            }
          } catch (e) {
            console.warn(
              'An error occurred when trying to parse query params data',
              e
            )
          }
        }}
      >
        Search
      </button>
      <h3 style={{ fontSize: 20, fontWeight: 600 }}>Bids</h3>
      {bids.map((bid, i) => (
        <div key={`${bid.id}:${i}`}>
          <div>Id: {bid.id}</div>
          <div>Price: {bid.price}</div>
          <div>Source: {bid.source.name as string}</div>
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

export default UserTopBids
