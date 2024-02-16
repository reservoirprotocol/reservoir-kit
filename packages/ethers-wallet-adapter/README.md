<h3 align="center">Reservoir Ethers Wallet Adapter</h3>

### Installation

```
pnpm install @reservoir0x/ethers-wallet-adapter @reservoir0x/reservoir-sdk
```

Also make sure to install the peer dependencies required by the adapter if your application doesn't already include them:

```
pnpm install ethers viem @reservoir0x/reservoir-sdk
```

### Usage

To use the adapter simply pass in your ethers signer and receive a normalized ReservoirWallet object:

```
import { getClient } from '@reservoir0x/reservoir-sdk'
import { adaptEthersSigner } from '@reservoir0x/ethers-wallet-adapter'
import { useSigner } from 'wagmi'

...

const { data: signer } = useSigner()
const wallet = adaptEthersSigner(signer)

getClient().actions.buyToken({
  items: [
    {
      collection: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
    },
  ],
  wallet,
  onProgress: () => {},
})
```

In the code snippet above we use the wagmi `useSigner` method, which is not required, you can create your ethers signer however you wish. We then adapt the signer to the ReservoirWallet object and pass this into any of the SDK methods. Here we pass it into the buyToken method along with the other required parameters.
