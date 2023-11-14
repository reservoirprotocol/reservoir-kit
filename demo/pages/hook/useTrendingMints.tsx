import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useTrendingMints } from '@reservoir0x/reservoir-kit-ui';
import ChainSwitcher from 'components/ChainSwitcher';
import { NextPage } from 'next';

const Collections: NextPage = () => {

  const {
    data: collections,
  } = useTrendingMints({
    period: '24h',
    limit: 50,
  })


  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        width: '100%',
        padding: 24,
        flexDirection: 'column',
        alignItems: 'flex-start',
      }}
    >
      <ConnectButton />
      <h3 style={{ fontSize: 20, fontWeight: 600 }}>Trending Mints</h3>
      {collections.map((collection, i) => (
        <div key={`${collection?.id}-${i}`}>
          <div>Id: {collection?.id}</div>
          <div>Name: {collection?.name}</div>
        </div>
      ))}
      <ChainSwitcher />
    </div>
  )
}

export default Collections
