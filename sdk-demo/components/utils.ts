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
          ...reservoirChains.polygon,
          active: true
        },
      ],
      source: 'reservoirkit.demo',
      synchronousStepItemExecution: true
    })
  }

  return client
}
