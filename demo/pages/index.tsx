import { NextPage } from 'next'
import { Modal, TokenPrimitive } from '@reservoir0x/reservoir-kit'

const Trigger = <button>Trigger</button>

const Index: NextPage = () => {
  return (
    <Modal trigger={Trigger} title="title">
      <TokenPrimitive
        img="https://lh3.googleusercontent.com/PzJGhIVImcDq79IJZmgAYgGXTX78jIM1dTdXqLmyD-FWDFrg-CIjzWbiPiAZHEdssS_XiwOj9silSxnvuYtX9GKNxMP28coj7v_Q=w533"
        name="#9854"
        price={24.3458982734}
        usdPrice={44000}
        collection="MoonBirds"
        royalty={10}
        source="https://lh3.googleusercontent.com/PzJGhIVImcDq79IJZmgAYgGXTX78jIM1dTdXqLmyD-FWDFrg-CIjzWbiPiAZHEdssS_XiwOj9silSxnvuYtX9GKNxMP28coj7v_Q=w533"
      />
    </Modal>
  )
}

export default Index
