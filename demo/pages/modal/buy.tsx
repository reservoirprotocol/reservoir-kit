import { NextPage } from 'next'
import { BuyModal } from '@reservoir0x/reservoir-kit-ui'
import { ConnectButton, useConnectModal } from '@rainbow-me/rainbowkit'
import ThemeSwitcher from 'components/ThemeSwitcher'
import { useState } from 'react'
import DeeplinkCheckbox from 'components/DeeplinkCheckbox'
import { useRouter } from 'next/router'
import ChainSwitcher from 'components/ChainSwitcher'
import { CrossmintPayButton } from "@crossmint/client-sdk-react-ui";
import { BuyTokenBodyParameters } from '@reservoir0x/reservoir-sdk'

const DEFAULT_COLLECTION_ID =
  process.env.NEXT_PUBLIC_DEFAULT_COLLECTION_ID ||
  '0xe14fa5fba1b55946f2fa78ea3bd20b952fa5f34e'
const DEFAULT_TOKEN_ID = process.env.NEXT_PUBLIC_DEFAULT_TOKEN_ID || '39'
const NORMALIZE_ROYALTIES = process.env.NEXT_PUBLIC_NORMALIZE_ROYALTIES
  ? process.env.NEXT_PUBLIC_NORMALIZE_ROYALTIES === 'true'
  : false

const BuyPage: NextPage = () => {
  const router = useRouter()
  const [token, setToken] = useState(`${DEFAULT_COLLECTION_ID}:${DEFAULT_TOKEN_ID}`)
  const [orderId, setOrderId] = useState('')
  const [chainId, setChainId] = useState<string | number>('')
  const [feesOnTopBps, setFeesOnTopBps] = useState<string[]>([])
  const [feesOnTopUsd, setFeesOnTopUsd] = useState<string[]>([])
  const [executionMethod, setExecutionMethod] = useState<BuyTokenBodyParameters['executionMethod']>()
  const deeplinkOpenState = useState(true)
  const hasDeeplink = router.query.deeplink !== undefined
  const [normalizeRoyalties, setNormalizeRoyalties] =
    useState(NORMALIZE_ROYALTIES)
  const { openConnectModal } = useConnectModal()
  const collectionId = token?.split(':')[0]


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
        <label>Token: </label>
        <input
          type="text"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
      </div>
      <div>
        <label>Order Id: </label>
        <input
          type="text"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
        />
      </div>
      <div>
        <label>Chain Override: </label>
        <input
          type="text"
          value={chainId}
          onChange={(e) => setChainId(e.target.value)}
        />
      </div>
      <div>
        <label>Fees on top (BPS): </label>
        <textarea
          onChange={() => {}}
          onBlur={(e) => {
            if (e.target.value && e.target.value.length > 0) {
              try {
                setFeesOnTopBps(JSON.parse(e.target.value))
              } catch (err) {
                e.target.value = ''
                setFeesOnTopBps([])
              }
            } else {
              e.target.value = ''
              setFeesOnTopBps([])
            }
          }}
        />
      </div>
      <div>
        <label>Fees on top (USD): </label>
        <textarea
          onChange={() => {}}
          onBlur={(e) => {
            if (e.target.value && e.target.value.length > 0) {
              try {
                setFeesOnTopUsd(JSON.parse(e.target.value))
              } catch (err) {
                e.target.value = ''
                setFeesOnTopUsd([])
              }
            } else {
              e.target.value = ''
              setFeesOnTopUsd([])
            }
          }}
        />
      </div>
      <div>
        <label>Execution Method: </label>
        <input
          type="text"
          value={executionMethod}
          onChange={(e) => { 
            if(e.target.value === '') {
              setExecutionMethod(undefined)
            }
            else {
              setExecutionMethod(e.target.value as BuyTokenBodyParameters['executionMethod'])
            }
          }}
        />
      </div>
      <DeeplinkCheckbox />
      <div>
        <label>Normalize Royalties: </label>
        <input
          type="checkbox"
          checked={normalizeRoyalties}
          onChange={(e) => {
            setNormalizeRoyalties(e.target.checked)
          }}
        />
      </div>

      <BuyModal
      creditCardCheckoutButton={
<CrossmintPayButton
style={{
  width: '100%',
}}
        clientId=""
        projectId=""
        collectionId={collectionId}
        environment='staging'
        emailTo={"USER_EMAIL_"}  // OPTIONAL: provide if you want to specify the exact destination
        mintTo={"OPTIONAL_DESTINATION_WALLET_"}  // OPTIONAL: provide if you want to specify the exact destination
        checkoutProps={{
          display: "same-tab",  // "same-tab" | "new-tab" | "popup"
          delivery: 'custodial',
          paymentMethods: ["ETH", "fiat"],
        }}
        mintConfig={{
          tokenId: '',
          type: "erc-721",
          quantity: "_NUMBER_OF_NFTS_",
          totalPrice: "_PRICE_IN_NATIVE_TOKEN_"
          // your custom minting arguments...
        }}
        />

      }
        chainId={Number(chainId)}
        trigger={
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
          >
            Buy Now
          </button>
        }
        token={token}
        orderId={orderId}
        feesOnTopBps={feesOnTopBps}
        feesOnTopUsd={feesOnTopUsd}
        normalizeRoyalties={normalizeRoyalties}
        executionMethod={executionMethod}
        openState={hasDeeplink ? deeplinkOpenState : undefined}
        onConnectWallet={() => {
          openConnectModal?.()
        }}
        onGoToToken={() => console.log('Go to token')}
        onPurchaseComplete={(data) => {
          console.log('Purchase Complete', data)
        }}
        onPurchaseError={(error, data) => {
          console.log('Transaction Error', error, data)
        }}
        onClose={() => {
          console.log('BuyModal Closed')
        }}
        onPointerDownOutside={(e) => {
          console.log('onPointerDownOutside')
        }}
      />
      <ThemeSwitcher />
      <ChainSwitcher />
    </div>
  )
}

export default BuyPage
