import { NextPage } from 'next'
import {
  CollectButton,
  useReservoirClient,
} from '@reservoir0x/reservoir-kit-ui'
import { useState } from 'react'
import ThemeSwitcher from 'components/ThemeSwitcher'
import ChainSwitcher from 'components/ChainSwitcher'
import { ConnectButton, useConnectModal } from '@rainbow-me/rainbowkit'

const DEFAULT_COLLECTION_ID =
  process.env.NEXT_PUBLIC_DEFAULT_COLLECTION_ID ||
  '0xe14fa5fba1b55946f2fa78ea3bd20b952fa5f34e'

const CollectButtonPage: NextPage = () => {
  const [collectionId, setCollectionId] = useState<string | undefined>(DEFAULT_COLLECTION_ID)
  const [contract, setContract] = useState<string | undefined>()
  const [token, setToken] = useState<string | undefined>()
  const client = useReservoirClient()
  const chain = client?.currentChain()
  const { openConnectModal } = useConnectModal()

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
          onChange={(e) => {
            if(e.target.value) { 
              setCollectionId(e.target.value) 
            }
            else { 
              setCollectionId(undefined)
            }
          }}
        />
      </div>
      <div>
        <label>Contract: </label>
        <input
          type="text"
          value={contract}
          onChange={(e) => {
            if(e.target.value) { 
              setContract(e.target.value) 
            }
            else { 
              setContract(undefined)
            }
          }}
        />
      </div>
      <div>
        <label>Token: </label>
        <input
          type="text"
          value={token}
          onChange={(e) => {
            if(e.target.value) { 
              setToken(e.target.value) 
            }
            else { 
              setToken(undefined)
            }
          }}
        />
      </div>
      <CollectButton 
        collectionId={collectionId} 
        contract={contract} 
        token={token} 
        chainId={chain?.id} 
        onConnectWallet={() => {
          openConnectModal?.()
        }}/>
      <ChainSwitcher /> 
      <ThemeSwitcher />
    </div>
  )
}

export default CollectButtonPage
