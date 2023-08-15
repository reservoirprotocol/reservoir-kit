<h3 align="center">Reservoir Ethers Wallet Adapter</h3>

### Installation

```
yarn add @reservoir0x/gelato-adapter @reservoir0x/reservoir-sdk
```

Also make sure to install the peer dependencies required by the adapter if your application doesn't already include them:

```
yarn add ethers viem @reservoir0x/reservoir-sdk
```

### Usage

To use the adapter pass in your ethers signer and gelato api key. In return receive a normalized ReservoirWallet object:

```
import { getClient } from '@reservoir0x/reservoir-sdk'
import { adaptGelatoRelayer } from '@reservoir0x/gelato-adapter'
import { useSigner } from 'wagmi'

...

const { data: signer } = useSigner()
const wallet = adaptGelatoRelayer(signer, GELATO_API_KEY)

getClient().actions.buyToken({
  items: [
    {
      collection: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
    },
  ],
  options: {
    usePermit: true,
    currency: '0x07865c6e87b9f70255377e024ace6630c1eaa37f', //GOERLI USDC
  },
  wallet,
  onProgress: () => {},
})
```

In the code snippet above we use the wagmi `useSigner` method, which is not required, you can create your ethers signer however you wish. We then adapt the signer to the ReservoirWallet object and pass this into any of the SDK methods. Here we pass it into the buyToken method along with the other required parameters. In order for the purchase to be successful you'll need the following:

- Configure your gelato application to whitelist Reservoir's PermitProxy.
- Pass usePermit: true to make the API return calldata that routes to the permit proxy
- Make sure the erc20 used for purchase is compatible with Permit2. (USDC, etc)
