import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useTrendingMints } from '@reservoir0x/reservoir-kit-ui';
import ChainSwitcher from 'components/ChainSwitcher';
import { NextPage } from 'next';

const Collections: NextPage = () => {

  const {
    data: mints,
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
      {mints.map((mint, i) => (
        <div key={`${mint?.id}-${i}`}>
          <div>Id: {mint?.id}</div>
          <div>Name: {mint?.name}</div>
        </div>
      ))}
      <ChainSwitcher />
    </div>
  )
}

export default Collections
