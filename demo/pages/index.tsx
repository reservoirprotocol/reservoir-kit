import { NextPage } from 'next'
import { ReservoirKitProvider } from '@reservoir0x/reservoir-kit'

const Index: NextPage = () => {
  return (
    <ReservoirKitProvider
      options={{ apiBase: 'https://api-rinkeby.reservoir.tools' }}
    >
      ReservoirKit
    </ReservoirKitProvider>
  )
}

export default Index
