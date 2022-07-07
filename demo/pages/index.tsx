import { NextPage } from 'next'
import { ReservoirKitProvider } from '@reservoir0x/reservoir-kit'
import { Modal } from '@reservoir0x/reservoir-kit'

const Trigger = <button>Trigger</button>

const Index: NextPage = () => {
  return (
    <Modal trigger={Trigger} title="title">
      CHILDREN
    </Modal>
  )
}

export default Index
