import { NextPage } from 'next'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import ThemeSwitcher from 'components/ThemeSwitcher'
import { useEffect, useState } from 'react'
import { useReservoirClient } from '@reservoir0x/reservoir-kit-ui'
import { useSigner } from 'wagmi'

const DEFAULT_COLLECTION_ID =
  process.env.NEXT_PUBLIC_DEFAULT_COLLECTION_ID ||
  '0xe14fa5fba1b55946f2fa78ea3bd20b952fa5f34e'

const MintPage: NextPage = () => {
  const [collectionId, setCollectionId] = useState(DEFAULT_COLLECTION_ID)
  const [quantity, setQuantity] = useState(1)
  const [tempQuantity, setTempQuantity] = useState<string | number>(1)
  const client = useReservoirClient()
  const { data: signer } = useSigner()

  useEffect(() => {
    const delayInputTimeoutId = setTimeout(() => {
      if (typeof tempQuantity === 'number') {
        setQuantity(tempQuantity)
      }
    }, 500)
    return () => clearTimeout(delayInputTimeoutId)
  }, [tempQuantity])

  return (
    <div
      style={{
        display: 'flex',
        height: 50,
        width: '100%',
        gap: 12,
        padding: 24,
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 150,
      }}
    >
      <ConnectButton />
      <div>
        <label>Collection Id: </label>
        <input
          type="text"
          value={collectionId}
          onChange={(e) => setCollectionId(e.target.value)}
        />
      </div>
      <div>
        <label>Quantity: </label>
        <input
          type="text"
          value={tempQuantity}
          onChange={(e) => {
            setTempQuantity(e.target.value)
          }}
        />
      </div>
      <button
        style={{
          marginTop: 50,
          padding: 24,
          background: 'blue',
          color: 'white',
          fontSize: 18,
          border: '1px solid #ffffff',
          borderRadius: 8,
          fontWeight: 800,
          cursor: 'pointer',
        }}
        onClick={() => {
          if (!signer) {
            throw 'Missing a signer'
          }
          client?.actions.mint({
            collection: collectionId,
            quantity,
            signer,
            onProgress: (steps, path) => {
              console.log('steps', steps)
              console.log('path', path)
            },
          })
        }}
      >
        Mint
      </button>

      <ThemeSwitcher />
    </div>
  )
}

export default MintPage
