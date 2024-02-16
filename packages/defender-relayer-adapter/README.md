<h3 align="center">Reservoir Defender Relayer Adapter</h3>

### Installation

```
pnpm install @reservoir0x/defender-relayer-adapter @reservoir0x/reservoir-sdk
```

Also make sure to install the peer dependencies required by the adapter if your application doesn't already include them:

```
pnpm install ethers viem @reservoir0x/defender-relayer-adapter @reservoir0x/reservoir-sdk
```

### Usage

To use the adapter simply pass in your relayer credentials and receive a normalized ReservoirWallet object:

```
import { getClient } from '@reservoir0x/reservoir-sdk'
import { adaptDefenderRelay } from '@reservoir0x/defender-relayer-adapter'

...

const credentials = {
  apiKey: '' // Your OpenZepplin relayer apiKey,
  apiSecret: '' // Your OpenZepplin relaer apiSecret,
}

const wallet = adaptDefenderRelay(credentials)

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

In the code above, we pass in our relayer credentials to adapt the signer to the ReservoirWallet object and pass this into any of the SDK methods. Here we pass it into the buyToken method along with the other required parameters.
