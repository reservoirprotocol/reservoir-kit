# @reservoir0x/reservoir-kit

ReservoirKit is the official Reservoir Protocol UI Kit. You can choose to use the prebuilt UI or create your own UI while utilizing the logic layer.

Check out the [client sdk sandbox](https://github.com/reservoirprotocol/sandbox) and the [docs](https://docs.reservoir.tools) to learn more.

## Getting Started

### Installing the SDK

```
yarn add @reservoir0x/reservoir-kit
```

or

```
npm install @reservoir0x/reservoir-kit --save
```

### Configuring the SDK

```
ReservoirSDK.init({
  apiBase: "https://api.reservoir.tools"
});
```

Add the following code to your app's entry file (App.tsx/App.js or equivalent). The code above initializes and conigures the reservoir SDK with some base parameters. Pass in any additional options that are applicable, the only required one is the `apiBase`.

Now you're all set, to interact with the ReservoirSDK instance you need to call the follow function:

```
ReservoirSDK.client()
```

Then you can access actions or utils accordingly:

```
ReservoirSDK.client().actions.buyToken(...)
```

Head over to our [docs](https://docs.reservoir.tools) to learn more.

## Updating the types

To get the latest types for the Reservoir API, navigate to `/src/types` and run the following command:

```bs
npx openapi-typescript https://api.reservoir.tools/swagger.json --output api.ts
```
