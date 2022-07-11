import { NextPage } from 'next'
import { BuyModal } from '@reservoir0x/reservoir-kit-ui'

const Trigger = <button>Trigger</button>

const Index: NextPage = () => {
  return (
    <BuyModal
      trigger={Trigger}
      collectionId="0x27af21619746a2abb01d3056f971cde936145939"
      tokenId="197"
      referrer="0x0"
      referrerFee={10.1}
    />
  )
}

export default Index
