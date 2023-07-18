import { NextPage } from 'next'
import {
  TokenMedia,
  useReservoirClient,
  useTokens,
} from '@reservoir0x/reservoir-kit-ui'
import { ComponentPropsWithoutRef, useState } from 'react'
import ThemeSwitcher from 'components/ThemeSwitcher'

const DEFAULT_COLLECTION_ID =
  process.env.NEXT_PUBLIC_DEFAULT_COLLECTION_ID ||
  '0xe14fa5fba1b55946f2fa78ea3bd20b952fa5f34e'
const DEFAULT_TOKEN_ID = process.env.NEXT_PUBLIC_DEFAULT_TOKEN_ID || '2'

const TokenMediaPage: NextPage = () => {
  const [collectionId, setCollectionId] = useState(DEFAULT_COLLECTION_ID)
  const [tokenId, setTokenId] = useState(DEFAULT_TOKEN_ID)
  const [showGrid, setShowGrid] = useState(true)
  const [staticOnly, setStaticOnly] = useState(false)
  const [imageResolution, setImageResolution] = useState('medium')
  const [disableOnChainRendering, setDisableOnChainRendering] = useState(false)
  const [fallbackMode, setFallbackMode] =
    useState<ComponentPropsWithoutRef<typeof TokenMedia>['fallbackMode']>(
      'default'
    )
  const client = useReservoirClient()
  const chain = client?.currentChain()

  const { data: tokens } = useTokens(
    collectionId
      ? {
          collection: showGrid ? collectionId : undefined,
          tokens: !showGrid ? [`${collectionId}:${tokenId}`] : undefined,
        }
      : false
  )

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
      <nav style={{ display: 'flex', gap: 15, marginBottom: 20 }}>
        <a
          style={
            !showGrid
              ? { textDecoration: 'underline', cursor: 'pointer' }
              : undefined
          }
          onClick={() => setShowGrid(true)}
        >
          Grid View
        </a>
        <a
          style={
            showGrid
              ? { textDecoration: 'underline', cursor: 'pointer' }
              : undefined
          }
          onClick={() => setShowGrid(false)}
        >
          Token View
        </a>
      </nav>
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
      {!showGrid && (
        <div>
          <label>Token Id: </label>
          <input
            placeholder="Token Id"
            type="text"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            style={{ width: 250 }}
          />
        </div>
      )}
      <div>
        <label>staticOnly: </label>
        <input
          type="checkbox"
          checked={staticOnly}
          onChange={(e) => {
            setStaticOnly(e.target.checked)
          }}
        />
      </div>
      <div>
        <label>imageResolution: </label>
        <input
          placeholder="small | medium | large"
          type="text"
          value={imageResolution}
          onChange={(e) => setImageResolution(e.target.value)}
        />
      </div>
      <div>
        <label>disableOnChainRendering: </label>
        <input
          type="checkbox"
          checked={disableOnChainRendering}
          onChange={(e) => setDisableOnChainRendering(e.target.checked)}
        />
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <label>fallbackMode: </label>
        <div style={{ display: 'flex', gap: 10 }}>
          <div>
            <input
              type="radio"
              value="default"
              checked={fallbackMode === 'default'}
              onChange={() => setFallbackMode('default')}
            />
            <label>default</label>
          </div>
          <div>
            <input
              type="radio"
              value="simple"
              checked={fallbackMode === 'simple'}
              onChange={() => setFallbackMode('simple')}
            />
            <label>simple</label>
          </div>
        </div>
      </div>
      {showGrid ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 14,
          }}
        >
          {tokens.map((token, i) => (
            <TokenMedia
              key={i}
              token={token?.token}
              staticOnly={staticOnly}
              imageResolution={
                imageResolution as ComponentPropsWithoutRef<
                  typeof TokenMedia
                >['imageResolution']
              }
              onRefreshToken={() => {
                window.alert('Token was refreshed!')
              }}
              disableOnChainRendering={disableOnChainRendering}
              fallbackMode={fallbackMode}
              chainId={chain?.id}
            />
          ))}
        </div>
      ) : (
        <TokenMedia
          token={tokens && tokens[0] ? tokens[0].token : undefined}
          staticOnly={staticOnly}
          imageResolution={
            imageResolution as ComponentPropsWithoutRef<
              typeof TokenMedia
            >['imageResolution']
          }
          style={{
            minWidth: '400px',
            minHeight: '400px',
          }}
          onRefreshToken={() => {
            window.alert('Token was refreshed!')
          }}
          disableOnChainRendering={disableOnChainRendering}
          chainId={chain?.id}
        />
      )}
      <ThemeSwitcher />
    </div>
  )
}

export default TokenMediaPage
