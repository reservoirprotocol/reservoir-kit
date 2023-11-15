import {
  createClient,
  getClient as getReservoirClient,
} from '@reservoir0x/reservoir-sdk'
import * as allChains from 'wagmi/chains'

export const getClient = () => {
  let client = getReservoirClient()

  if (!client) {
    return createClient({
      chains: [
        {
          baseApiUrl: 'https://api-goerli.reservoir.tools',
          id: allChains.goerli.id,
          active: true,
          name: 'Goerli'
        },
      ],
      source: 'reservoirkit.demo',
    })
  }

  return client
}
