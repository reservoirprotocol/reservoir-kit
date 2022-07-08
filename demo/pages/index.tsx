import { NextPage } from 'next'
import { BuyModal } from '@reservoir0x/reservoir-kit'

const Trigger = <button>Trigger</button>

const Index: NextPage = () => {
  return <BuyModal trigger={Trigger} />
}

export default Index
