const { createClient } = require('@reservoir0x/reservoir-sdk')
const { adaptDefenderRelay } = require('@reservoir0x/defender-relayer-adapter')

const args = process.argv.slice(2).reduce((acc, arg) => {
  const [key, value] = arg.split('=')
  acc[key.replace('--', '')] = value
  return acc
}, {})

const client = createClient({
  chains: [
    {
      id: 137,
      baseApiUrl: 'https://api-polygon.reservoir.tools',
      active: true,
    },
  ],
  logLevel: 4,
})

const credentials = {
  apiKey: args.apiKey || '',
  apiSecret: args.apiSecret || '',
}

const wallet = adaptDefenderRelay(credentials)

client.actions
  .buyToken({
    chainId: 137,
    items: [
      {
        token: '0x22d5f9b75c524fec1d6619787e582644cd4d7422:1249',
      },
    ],
    wallet,
    onProgress: () => {},
  })
  .then((data) => {
    console.log(data)
  })
