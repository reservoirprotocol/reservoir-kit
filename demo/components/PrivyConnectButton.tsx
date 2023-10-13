import {usePrivy, useWallets} from '@privy-io/react-auth'
import {usePrivyWagmi} from '@privy-io/wagmi-connector'
import { useNetwork } from 'wagmi'

export const PrivyConnectButton = () => {
  const { login, logout, ready, authenticated, connectWallet, linkWallet, unlinkWallet} = usePrivy()
  const { wallets } = useWallets()
  const { wallet: activeWallet, setActiveWallet } = usePrivyWagmi()
  const { chain } = useNetwork()


  console.log(wallets)

  if (!ready) return null;

  if (!authenticated) {
    return <button onClick={() => login()}>Connect Wallet</button>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px'}}>
      <div>Active Wallet: {activeWallet?.address}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px'}}>
        {wallets.map((wallet) => {
          return (
            <div
              key={wallet.address}
              style={{ display: 'flex', gap: '10px'}}
            >
              <div>
                {wallet.address}
              </div>
              <button
                onClick={() => {
                  const connectedWallet = wallets.find(
                    (w) => w.address === wallet.address,
                  );
                  if (!connectedWallet) connectWallet();
                  else setActiveWallet(connectedWallet);
                }}
                disabled={wallet.address === activeWallet?.address}
              >Make active</button>
              <button onClick={() => unlinkWallet(wallet.address)}>Unlink</button>
            </div>
          )
        })}
      </div>
      <div style={{ display: 'flex', gap: '10px'}}>
        <button onClick={linkWallet}>Link another wallet</button>
        <button onClick={logout}>Logout from Privy</button>
      </div>
      
    </div>
  )
}