import { NextPage } from 'next'
import { BuyModal } from '@reservoir0x/reservoir-kit-ui'
import { useSigner } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'

const Trigger = (
  <button style={{ padding: 10, border: '1px solid #ffffff', borderRadius: 8 }}>
    Buy Modal
  </button>
)

const Index: NextPage = () => {
  const { data: signer } = useSigner()

  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        margin: 20,
        flexDirection: 'column',
        alignItems: 'flex-start',
      }}
    >
      <ConnectButton />
      <BuyModal
        trigger={Trigger}
        collectionId="0x27af21619746a2abb01d3056f971cde936145939"
        tokenId="197"
        referrer="0xFd03726FD90ccc7386bf62b44Bb594f7cbFB3995"
        referrerFee={10.1}
        signer={signer}
      />
    </div>
  )
}

export default Index
