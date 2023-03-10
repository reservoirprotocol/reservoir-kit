import { NextPage } from 'next'
import { CartPopover, useDynamicTokens } from '@reservoir0x/reservoir-kit-ui'
import { useState } from 'react'
import ThemeSwitcher from 'components/ThemeSwitcher'
import { useConnectModal } from '@rainbow-me/rainbowkit'

const DEFAULT_COLLECTION_ID =
  process.env.NEXT_PUBLIC_DEFAULT_COLLECTION_ID ||
  '0xe14fa5fba1b55946f2fa78ea3bd20b952fa5f34e'

const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID

const CartPage: NextPage = () => {
  const { openConnectModal } = useConnectModal()
  const [collectionId, setCollectionId] = useState(DEFAULT_COLLECTION_ID)
  const {
    data: tokens,
    remove,
    add,
  } = useDynamicTokens(
    collectionId
      ? {
          collection: collectionId,
          limit: 100,
          includeDynamicPricing: true,
        }
      : false
  )

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
        boxSizing: 'border-box',
      }}
    >
      <CartPopover
        trigger={<button>Cart</button>}
        onConnectWallet={() => {
          openConnectModal?.()
        }}
      />
      <div>
        <label>Collection Id: </label>
        <input
          placeholder="Collection Id"
          type="text"
          value={collectionId}
          onChange={(e) => setCollectionId(e.target.value)}
          style={{ width: 250 }}
        />
      </div>
      {tokens.map((token) => {
        return (
          <div key={token?.token?.tokenId} style={{ display: 'flex', gap: 12 }}>
            <input
              type="checkbox"
              checked={token.isInCart}
              onChange={() => {}}
              onClick={() => {
                if (!token?.token || !token.token.collection?.id || !CHAIN_ID) {
                  return
                }

                if (token.isInCart) {
                  remove([
                    `${token.token.collection.id}:${token.token.tokenId}`,
                  ])
                } else {
                  add([token], Number(CHAIN_ID))
                }
              }}
            />
            <div>
              <div>
                Name: {token?.token?.name} - {token?.token?.tokenId}
              </div>
              <div>Price: {token.market?.floorAsk?.price?.amount?.decimal}</div>
            </div>
          </div>
        )
      })}
      <ThemeSwitcher />
    </div>
  )
}

export default CartPage
