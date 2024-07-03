import {
  createClient,
  getClient as getReservoirClient,
  reservoirChains
} from '@reservoir0x/reservoir-sdk'

export const getClient = () => {
  let client = getReservoirClient()

  if (!client) {
    return createClient({
      chains: [
        {
          ...reservoirChains.mainnet,
          active: true
        },
      ],
      source: 'reservoirkit.demo',
      synchronousStepItemExecution: true
    })
  }

  return client
}
