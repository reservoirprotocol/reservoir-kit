import { arrayify, splitSignature } from 'ethers/lib/utils'
import { BatchExecute } from '../types'
import { pollUntilHasData } from './pollApi'
import { Signer } from 'ethers'
import { TypedDataSigner } from '@ethersproject/abstract-signer'
import axios, { AxiosRequestConfig } from 'axios'
import { getClient } from '../actions/index'

/**
 * When attempting to perform actions, such as, selling a token or
 * buying a token, the user's account needs to meet certain requirements. For
 * example, if the user attempts to buy a token the Reservoir API checks if the
 * user has enough balance, before providing the transaction to be signed by
 * the user. This function executes all transactions, in order, to complete the
 * action.
 * @param request AxiosRequestConfig object with at least a url set
 * @param signer Ethereum signer object provided by the browser
 * @param setState Callback to update UI state has execution progresses
 * @returns The data field of the last element in the steps array
 */

export async function batchExecuteSteps(
  request: AxiosRequestConfig,
  signer: Signer,
  setState: (steps: BatchExecute['steps']) => any,
  newJson?: BatchExecute
) {
  try {
    let json = newJson

    if (!request.headers) {
      request.headers = {}
    }

    const client = getClient()
    if (client && client.apiKey) {
      request.headers = {
        'x-api-key': client.apiKey,
      }
    }
    if (!json) {
      const res = await axios.request(request)
      json = res.data as BatchExecute
      if (res.status !== 200) throw json
    }

    // Handle errors
    if (json.error || !json.steps) throw json

    // Handle price changes to protect users from paying more
    // than expected when buying and selling for less than expected
    // when selling

    // Todo when implementing buying and selling

    // Update state on first call or recursion
    setState([...json?.steps])

    let incompleteStepIndex = -1
    let incompleteStepItemIndex = -1
    json.steps.find((step, i) => {
      if (!step.items) {
        return false
      }

      incompleteStepItemIndex = step.items.findIndex(
        (item) => item.status == 'incomplete'
      )
      if (incompleteStepItemIndex !== -1) {
        incompleteStepIndex = i
        return true
      }
    })

    // There are no more incomplete steps
    if (incompleteStepIndex === -1) return

    const step = json.steps[incompleteStepIndex]
    const stepItems = json.steps[incompleteStepIndex].items

    if (!stepItems) return

    let { kind } = step
    let stepItem = stepItems[incompleteStepItemIndex]

    // Append any extra params provided by API
    // if (json.query) setParams(url, json.query)

    // If step item is missing data, poll until it is ready
    if (!stepItem.data) {
      json = (await pollUntilHasData(request, (json) => {
        const data = json as BatchExecute
        return data?.steps?.[incompleteStepIndex].items?.[
          incompleteStepItemIndex
        ].data
          ? true
          : false
      })) as BatchExecute
      if (!json.steps || !json.steps[incompleteStepIndex].items) throw json
      const items = json.steps[incompleteStepIndex].items
      if (
        !items ||
        !items[incompleteStepItemIndex] ||
        !items[incompleteStepItemIndex].data
      )
        throw json
      stepItem = items[incompleteStepItemIndex]
    }

    const stepData = stepItem.data

    // Handle each step based on it's kind
    switch (kind) {
      // Make an on-chain transaction
      case 'transaction': {
        // json.steps[incompleteIndex].message = 'Waiting for user to confirm'
        // setState([...json?.steps])
        const tx = await signer.sendTransaction(stepData)

        if (json.steps[incompleteStepIndex].items?.[incompleteStepItemIndex]) {
          stepItem.txHash = tx.hash
        }
        setState([...json?.steps])

        await tx.wait()
        break
      }

      // Sign a message
      case 'signature': {
        let signature: string | undefined
        const signData = stepData['sign']
        const postData = stepData['post']

        if (signData) {
          // Request user signature
          if (signData.signatureKind === 'eip191') {
            signature = await signer.signMessage(arrayify(signData.message))
          } else if (signData.signatureKind === 'eip712') {
            signature = await (
              signer as unknown as TypedDataSigner
            )._signTypedData(signData.domain, signData.types, signData.value)
          }

          if (signature) {
            // Split signature into r,s,v components
            // Include signature params in any future requests
            // setParams(url, { r, s, v })
            request.params = {
              ...request.params,
              signature,
            }
          }
        }

        if (postData) {
          const url = new URL(request.url || '')
          const postOrderUrl = new URL(postData.endpoint, url.origin)

          // json.steps[incompleteIndex].message = 'Verifying'
          // setState([...json?.steps])

          try {
            const getData = async function () {
              let response = await axios.post(
                postOrderUrl.href,
                JSON.stringify(postData.body),
                {
                  method: postData.method,
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  params: request.params,
                }
              )

              return response
            }

            const res = await getData()

            if (res.status > 299 || res.status < 200) throw res.data
          } catch (err) {
            json.steps[incompleteStepIndex].error =
              'Your order could not be posted.'
            setState([...json?.steps])
            throw err
          }
        }

        break
      }

      // Confirm that an on-chain tx has been picked up by indexer
      case 'confirmation': {
        // const confirmationUrl = new URL(data.endpoint, url.origin)

        // json.steps[incompleteIndex].message = 'Verifying'
        // setState([...json?.steps])

        // await pollUntilOk(confirmationUrl)
        break
      }

      default:
        break
    }

    delete step.message
    stepItem.status = 'complete'

    // Recursively call executeSteps()
    await batchExecuteSteps(request, signer, setState, json)
  } catch (err: any) {
    const error = new Error(err?.message)
    console.error(error)
    throw err
  }
}
