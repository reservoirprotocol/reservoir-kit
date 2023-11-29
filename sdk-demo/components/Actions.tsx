'use client'
import { useAccount } from 'wagmi'
import BuyButton from './BuyButton'
import BidButton from './BidButton'
import { useEffect, useState } from 'react'
import TransferButton from './TransferButton'
import MintButton from './MintButton'

function Actions() {
  const { isConnected } = useAccount()

  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) return <></>

  return isConnected ? (
    <div
      style={{
        padding: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}
    >
      <BuyButton />
      <BidButton />
      <TransferButton />
      <MintButton />
    </div>
  ) : (
    <></>
  )
}

export default Actions
