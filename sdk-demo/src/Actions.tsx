import { useAccount } from 'wagmi'
import BuyButton from 'src/BuyButton'
import { useState } from 'react'
import BidButton from 'src/BidButton'

function Actions() {
  const { isConnected } = useAccount()
  const [items, setItems] = useState('')

  if (!isConnected) {
    return null
  }

  return (
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
    </div>
  )
}

export default Actions
