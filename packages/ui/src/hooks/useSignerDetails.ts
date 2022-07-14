import { useEffect, useState } from 'react'
import { Signer } from 'ethers'

import { getSignerDetails, SignerDetails } from '../lib/signer'

const useSignerDetails = (signer: Signer | false) => {
  const [details, setDetails] = useState<SignerDetails | null>(null)

  useEffect(() => {
    if (signer) {
      getSignerDetails(signer, { address: true, balance: true }).then(
        (signerDetails: SignerDetails) => {
          setDetails(signerDetails)
        }
      )
    }
  }, [signer])

  return details
}
export default useSignerDetails
