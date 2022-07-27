import { arrayify, splitSignature } from 'ethers/lib/utils'
import { Execute } from '../types'
import { pollUntilHasData, pollUntilOk } from './pollApi'
import { setParams } from './params'
import { Signer } from 'ethers'
import { TypedDataSigner } from '@ethersproject/abstract-signer'
import axios, { AxiosRequestHeaders } from 'axios'
import { getClient } from '../actions/index'

/**
 * When attempting to perform actions, such as, selling a token or
 * buying a token, the user's account needs to meet certain requirements. For
 * example, if the user attempts to buy a token the Reservoir API checks if the
 * user has enough balance, before providing the transaction to be signed by
 * the user. This function executes all transactions, in order, to complete the
 * action.
 * @param url URL object with the endpoint to be called. Example: `/execute/buy`
 * @param signer Ethereum signer object provided by the browser
 * @param setState Callback to update UI state has execution progresses
 * @param expectedPrice Token price used to prevent to protect buyer from price moves. Pass the number with unit 'ether'. Example: `1.543` means 1.543 ETH
 * @returns The data field of the last element in the steps array
 */
export async function executeSteps(
  url: URL,
  signer: Signer,
  setState: (steps: Execute['steps']) => any,
  newJson?: Execute,
  expectedPrice?: number
) {
  try {
    let json = newJson
    const client = getClient()
    const baseUrl = client.apiBase ? client.apiBase : url.origin

    if (!json) {
      const options: RequestInit | undefined = {}

      if (client && client.apiKey) {
        options.headers = {
          'x-api-key': client.apiKey,
        }
      }
      const res = await fetch(url.href, options)
      json = (await res.json()) as Execute
      if (!res.ok) throw json
    }

    // Handle errors
    if (json.error || !json.steps) throw json

    // Handle price changes to protect users from paying more
    // than expected when buying and selling for less than expected
    // when selling
    if (json.quote && expectedPrice) {
      // Check if the user is selling
      if (
        url.pathname.includes('/execute/sell') &&
        json.quote - expectedPrice < -0.00001
      ) {
        throw {
          type: 'price mismatch',
          message: `The quote price of ${json.quote} ETH is less than the expected price of ${expectedPrice} ETH`,
        }
      }

      // Check if the user is buying
      if (
        url.pathname.includes('/execute/buy') &&
        json.quote - expectedPrice > 0.00001
      ) {
        throw {
          type: 'price mismatch',
          message: `The quote price of ${json.quote} ETH is greater than the expected price of ${expectedPrice} ETH`,
        }
      }
    }

    // Update state on first call or recursion
    setState([...json?.steps])

    const incompleteIndex = json.steps.findIndex(
      ({ status }) => status === 'incomplete'
    )

    // There are no more incomplete steps
    if (incompleteIndex === -1) return

    let { kind, data } = json.steps[incompleteIndex]

    // Append any extra params provided by API
    if (json.query) setParams(url, json.query)

    // If step is missing data, poll until it is ready
    if (!data) {
      json = (await pollUntilHasData(url, incompleteIndex)) as Execute
      if (!json.steps) throw json
      data = json.steps[incompleteIndex].data
    }

    //Update tx data on current step from previous step if available
    json.steps[incompleteIndex].txHash = json.txHash

    // Handle each step based on it's kind
    switch (kind) {
      // Make an on-chain transaction
      case 'transaction': {
        json.steps[incompleteIndex].message = 'Waiting for user to confirm'
        setState([...json?.steps])

        const tx = await signer.sendTransaction(data)

        json.steps[incompleteIndex].message = 'Finalizing on blockchain'
        json.steps[incompleteIndex].txHash = tx.hash
        json.txHash = tx.hash
        setState([...json?.steps])

        await tx.wait()
        break
      }

      // Sign a message
      case 'signature': {
        let signature: string | undefined

        json.steps[incompleteIndex].message = 'Waiting for user to sign'
        setState([...json?.steps])

        // Request user signature
        if (data.signatureKind === 'eip191') {
          signature = await signer.signMessage(arrayify(data.message))
        } else if (data.signatureKind === 'eip712') {
          signature = await (
            signer as unknown as TypedDataSigner
          )._signTypedData(data.domain, data.types, data.value)
        }

        if (signature) {
          // Split signature into r,s,v components
          const { r, s, v } = splitSignature(signature)
          // Include signature params in any future requests
          setParams(url, { r, s, v })
        }

        break
      }

      // Post a signed order object to order book
      case 'request': {
        const postOrderUrl = new URL(`${baseUrl}${data.endpoint}`)

        json.steps[incompleteIndex].message = 'Verifying'
        setState([...json?.steps])

        try {
          const getData = async function () {
            const headers: AxiosRequestHeaders = {
              'Content-Type': 'application/json',
            }

            if (client && client.apiKey) {
              headers['x-api-key'] = client.apiKey
            }

            let response = await axios.post(
              postOrderUrl.href,
              JSON.stringify(data.body),
              {
                method: data.method,
                headers: headers,
              }
            )

            return response
          }

          const res = await getData()

          const resToJson = res.data as Execute

          if (res.status > 299 || res.status < 200) throw resToJson
        } catch (err) {
          json.steps[incompleteIndex].error = 'Your order could not be posted.'
          setState([...json?.steps])
          throw err
        }
        break
      }

      // Confirm that an on-chain tx has been picked up by indexer
      case 'confirmation': {
        const confirmationUrl = new URL(`${baseUrl}${data.endpoint}`)

        json.steps[incompleteIndex].message = 'Verifying'
        setState([...json?.steps])

        await pollUntilOk(confirmationUrl)
        break
      }

      default:
        break
    }

    delete json.steps[incompleteIndex].message
    json.steps[incompleteIndex].status = 'complete'

    // Recursively call executeSteps()
    await executeSteps(url, signer, setState, json)
  } catch (err: any) {
    const error = new Error(err?.message)
    console.error(error)
    throw err
  }
}
