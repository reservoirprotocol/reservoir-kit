import { BigNumber, Signer } from 'ethers'

type SignerDetailsOptions = {
  address?: boolean
  balance?: boolean
}

export type SignerDetails = {
  address?: string | null
  balance?: BigNumber | null
}

async function getSignerDetails(
  signer: Signer | undefined,
  options: SignerDetailsOptions
) {
  const data: SignerDetails = {}
  if (signer) {
    const promises = []
    const promiseKeys: string[] = []
    if (options.address) {
      promises.push(signer.getAddress())
      promiseKeys.push('address')
    }
    if (options.balance) {
      promises.push(signer.getBalance())
      promiseKeys.push('balance')
    }

    const resp = await Promise.allSettled(promises)
    promiseKeys.forEach((key, i) => {
      const promiseResp = resp[i]
      const result =
        promiseResp.status === 'fulfilled'
          ? (promiseResp as PromiseFulfilledResult<unknown> | undefined)
          : undefined

      switch (key) {
        case 'address': {
          data.address = result ? (result.value as typeof data.address) : null
          break
        }
        case 'balance': {
          data.balance = result ? (result.value as typeof data.balance) : null
          break
        }
      }
    })
  }

  return data
}

export { getSignerDetails }
