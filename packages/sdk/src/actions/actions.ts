import { acceptOffer } from './acceptOffer'
import { buyToken } from './buyToken'
import { cancelOrder } from './cancelOrder'
import { listToken } from './listToken'
import { placeBid } from './placeBid'
import { transferTokens } from './transferTokens'
import { mintToken } from './mintToken'
import { call } from './call'

const actions = {
  acceptOffer,
  buyToken,
  mintToken,
  cancelOrder,
  listToken,
  placeBid,
  transferTokens,
  call,
}

export default actions
