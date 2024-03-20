import { useLogin, usePrivy, useWallets } from '@privy-io/react-auth'
import { useSetActiveWallet } from '@privy-io/wagmi'
import { useAccount } from 'wagmi'


export const PrivyConnectButton = () => {
  const { logout, ready, authenticated, unlinkWallet, connectWallet, linkWallet } = usePrivy()
  const { wallets } = useWallets()
  const { setActiveWallet } = useSetActiveWallet()
  const { address } = useAccount()

  const { login } = useLogin({
    onComplete: (user, isNewUser, wasAlreadyAuthenticated) => {
      console.log('Login complete')
      if(wallets[0]) {
      setActiveWallet(wallets[0])
      }
    },
  })


  if (!ready) return null;

  if (!authenticated) {
    return <button onClick={() => login()}>Connect Wallet</button>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px'}}>
      <div>Active Wallet: {address}</div>
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
                disabled={wallet.address === address}
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