# @reservoir0x/reservoir-kit

ReservoirKit is the official Reservoir Protocol UI Kit. You can choose to use the prebuilt UI or create your own UI while utilizing the logic layer.

### Installing ReservoirKit

```
yarn add @reservoir0x/reservoir-kit-ui
```

Also make sure to install the peer dependencies required by ReservoirKit if your application doesn't already include them:

```
yarn add wagmi ethers react react-dom
```

### Configuring Reservoir Kit UI

```
import {
  ReservoirKitProvider,
  darkTheme,
} from '@reservoir0x/reservoir-kit-ui'
import { WagmiConfig } from 'wagmi'

const wagmiClient = ...

const theme = darkTheme({
  headlineFont: "Sans Serif",
  font: "Serif",
  primaryColor: "#323aa8",
  primaryHoverColor: "#252ea5",
})

<ReservoirKitProvider
  options={{
    apiBase: 'https://api.reservoir.tools,
  }}
  theme={reservoirKitTheme}
>
  <WagmiConfig client={wagmiClient}>

    { Your App }

  </WagmiConfig>
</ReservoirKitProvider>
```

The sample code above is all you need to get started with ReservoirKit. Let's break it down step by step. Start by importing the `ReservoirKitProvider` which is needed for configuring ReservoirKit. Also import a theme of your choice, we provide a lightTheme and a darkTheme. Next we import the `WagmiConfig`, Wagmi is a peer dependency of ReservoirKit.

Now that we have all the imports ready we can continue by creating a theme. As mentioned previously we have a few preloaded themes with the ability to override some variables, like colors and fonts. Learn more about theming options [here](#theming).

Next we wrap our app with the `ReservoirKitProvider` and pass it some options. The only required option is the `apiBase`, which we point to the production Reservoir hosted API endpoint. We also pass in the theme we previously set up. Now we need to make sure we wrap our application in the `WagmiConfig`. Follow the instructions in their docs to set up the `WagmiClient` and then pass it into the `WagmiConfig`. Finally nest your application code within the `ReservoirKitProvider` and the `WagmiConfig`.

### Theming

ReservoirKit provides 2 preconfigured themes, darkMode and lightMode. They can be used as is or configured with some additional overrides:

```
const theme = darkTheme({
  headlineFont: "Sans Serif",
  font: "Serif",
  primaryColor: "#323aa8",
  primaryHoverColor: "#252ea5",
})
```

Click [here](https://github.com/reservoirprotocol/reservoir-kit/blob/main/packages/ui/src/themes/ReservoirKitTheme.ts#L73) for a full list of overrides.

If that isn't enough customization you can also create a completely custom ReservoirKitTheme.

```
const theme: ReservoirKitTheme = {
  radii: { ... },
  fonts: { ... },
  colors: { ... }
}
```

## BuyModal

ReservoirKit provides a simple to configure modal for facilitating token purchases in your react app. Below is an example of a simple BuyModal setup.

```
import { BuyModal } from '@reservoir0x/reservoir-kit-ui'

<BuyModal
  trigger={
    <button>
      Buy Token
    </button>
  }
  collectionId="0xf5de760f2e916647fd766b4ad9e85ff943ce3a2b"
  tokenId="1236715"
  onComplete={() => console.log('Purchase Complete')}
/>
```

Let's dive into the parameters. You'll need to provide an element to trigger the modal, this can be any valid html element. Next you'll want to provide a collectionId and a tokenId. These can be set to undefined until the data is ready. Finally you can set an optional callback when the purchase is complete, where you can refresh the data, give your use a success message, etc.

## Custom BuyModal

The BuyModal also comes with a custom renderer which can be used to just get the data layer that the BuyModal uses internally to handle the underlying business logic. With the renderer you can rebuild the UI completely to your liking. Below is an example of how it works in practice.

```
import { BuyModal, BuyStep } from '@reservoir0x/reservoir-kit-ui'

<BuyModal.Custom
  open={open}
  tokenId={tokenId}
  collectionId={collectionId}>
  {({
    token,
    collection,
    totalPrice,
    referrerFee,
    buyStep,
    transactionError,
    hasEnoughEth,
    txHash,
    feeUsd,
    totalUsd,
    ethUsdPrice,
    isBanned,
    balance,
    address,
    etherscanBaseUrl,
    buyToken,
    setBuyStep,
  }) => {
    { Your Custom React Elements }
  })}
</BuyModal.Custom>
```

The custom BuyModal take a few parameters like before with one additional one being the open parameter. This is because there is no trigger, you have control over what sort of modal you want this to eventually live in and how to trigger that modal. You'll have the ability to add a custom button with a custom handler, etc. The custom BuyModal then passes some key data into the children which we parse above and use in our custom UI. It's also important to note the BuyStep here which is used to manage the internal state of the BuyModal's logic. You can decide to use all or some of the data passed into your custom implementation.
