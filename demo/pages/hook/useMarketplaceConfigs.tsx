import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useMarketplaceConfigs } from '@reservoir0x/reservoir-kit-ui';
import ChainSwitcher from 'components/ChainSwitcher';
import { NextPage } from 'next';
import { useState } from 'react';

const MarketplaceConfigs: NextPage = () => {
  const [collectionId, setCollectionId] = useState<string | undefined>()
  const [tokenId, setTokenId] = useState<string | undefined>()
  const { data: marketplaceConfigs } = useMarketplaceConfigs(
    collectionId as string,
    undefined, 
    { tokenId: tokenId }, 
    Boolean(collectionId)
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
      <ConnectButton />
      <div>
        <label>CollectionId: </label>
        <input
          type="text"
          value={collectionId}
          onChange={(e) => { 
            if(e.target.value === '') {
              setCollectionId(undefined)
            }
            else {
              setCollectionId(e.target.value)
            } 
          }}
        />
      </div>
      <div>
        <label>TokenId: </label>
        <input
          type="text"
          value={tokenId}
          onChange={(e) => { 
            if(e.target.value === '') {
              setTokenId(undefined)
            }
            else {
              setTokenId(e.target.value)
            } 
          }}
        />
      </div>
      <div style={{ display: 'flex', flexDirection:'column', gap: 20 }}>  
      {/* @ts-ignore: Return type is wrong */}
        {marketplaceConfigs?.marketplaces?.map((marketplace, idx) => (
          <div key={idx}>
            <div>Name: {marketplace?.name}</div>
            <div>Domain: {marketplace?.domain}</div>
            <div>Fee BPS: {marketplace?.fee?.bps}</div>
            <div>Orderbook: {marketplace?.orderbook}</div>
            <div>Royalties (min, max): {marketplace?.royalties?.minBps}, {marketplace?.royalties?.maxBps}</div>
          </div>
        ))}
      </div>
      <ChainSwitcher />
    </div>
  )
}

export default MarketplaceConfigs
