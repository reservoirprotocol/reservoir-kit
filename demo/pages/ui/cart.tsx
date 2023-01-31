import { NextPage } from 'next'
import { CartPopover, useCart, useTokens } from '@reservoir0x/reservoir-kit-ui'
import { useState } from 'react'
import ThemeSwitcher from 'components/ThemeSwitcher'

const DEFAULT_COLLECTION_ID =
  process.env.NEXT_PUBLIC_DEFAULT_COLLECTION_ID ||
  '0xe14fa5fba1b55946f2fa78ea3bd20b952fa5f34e'

const CartPage: NextPage = () => {
  const [collectionId, setCollectionId] = useState(DEFAULT_COLLECTION_ID)

  const { data: tokens, isValidating } = useTokens(
    collectionId
      ? {
          collection: collectionId,
          limit: 100,
        }
      : false
  )

  const { add, remove, data: items } = useCart((store) => store.items)
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
      <CartPopover trigger={<button>Cart</button>}></CartPopover>
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
        const checked = items.some((item) => {
          const { token: cartToken, collection } = item
          return (
            collection.id == token?.token?.collection?.id &&
            cartToken.id == token?.token?.tokenId
          )
        })
        return (
          <div key={token?.token?.tokenId}>
            <input
              type="checkbox"
              checked={checked}
              onChange={() => {}}
              onClick={(e) => {
                if (!token?.token || !token.token.collection?.id) {
                  return
                }

                if (checked) {
                  remove([
                    {
                      tokenId: token.token.tokenId,
                      collectionId: token.token.collection.id,
                    },
                  ])
                } else {
                  add([
                    {
                      token: {
                        id: token.token.tokenId,
                        name: token.token.name || `#${token.token.tokenId}`,
                      },
                      collection: {
                        id: token.token.collection.id,
                        name: token.token.collection.name || '',
                      },
                      price: token.market?.floorAsk?.price,
                    },
                  ])
                }
              }}
            />
            {token?.token?.name} - {token?.token?.tokenId}
          </div>
        )
      })}
      <ThemeSwitcher />
    </div>
  )
}

export default CartPage
