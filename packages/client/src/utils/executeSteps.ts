import { arrayify } from 'ethers/lib/utils'
import { Execute, paths } from '../types'
import { pollUntilHasData, pollUntilOk } from './pollApi'
import { Signer } from 'ethers'
import { TypedDataSigner } from '@ethersproject/abstract-signer'
import axios, { AxiosRequestConfig, AxiosRequestHeaders } from 'axios'
import { getClient } from '../actions/index'
import { setParams } from './params'
import { version } from '../../package.json'

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

export async function executeSteps(
  request: AxiosRequestConfig,
  signer: Signer,
  setState: (steps: Execute['steps']) => any,
  newJson?: Execute,
  expectedPrice?: number
) {
  try {
    let json = newJson

    if (!request.headers) {
      request.headers = {}
    }

    const client = getClient()
    if (client?.apiKey) {
      request.headers['x-api-key'] = client.apiKey
    }
    if (client?.uiVersion) {
      request.headers['x-rkui-version'] = client.uiVersion
    }
    request.headers['x-rkc-version'] = version

    if (!json) {
      const res = await axios.request(request)
      json = res.data as Execute
      if (res.status !== 200) throw json
    }

    // Handle errors
    if (json.error || !json.steps) throw json

    const isBuy = request.url?.includes('/execute/buy')
    const isSell = request.url?.includes('/execute/sell')

    // Handle price changes to protect users from paying more
    // than expected when buying and selling for less than expected
    if (json.path && expectedPrice) {
      const quote = json.path.reduce((total, path) => {
        total += path.quote || 0
        return total
      }, 0)

      // Check if the user is selling
      let error = null
      if (isSell && quote - expectedPrice < -0.00001) {
        error = {
          type: 'price mismatch',
          message: `The quote price of ${quote} is less than the expected price of ${expectedPrice}`,
        }
      }

      // Check if the user is buying
      if (isBuy && quote - expectedPrice > 0.00001) {
        error = {
          type: 'price mismatch',
          message: `The quote price of ${quote} is greater than the expected price of ${expectedPrice}`,
        }
      }

      if (error) {
        json.steps[0].error = error.message
        json.steps[0].errorData = json.path
        setState([...json?.steps])
        throw error
      }
    }

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

    // If step item is missing data, poll until it is ready
    if (!stepItem.data) {
      json = (await pollUntilHasData(request, (json) => {
        const data = json as Execute
        return data?.steps?.[incompleteStepIndex].items?.[
          incompleteStepItemIndex
        ].data
          ? true
          : false
      })) as Execute
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
        const tx = await signer.sendTransaction(stepData)

        if (json.steps[incompleteStepIndex].items?.[incompleteStepItemIndex]) {
          stepItem.txHash = tx.hash
        }
        setState([...json?.steps])

        await tx.wait()

        //Implicitly poll the confirmation url to confirm the transaction went through
        const confirmationUrl = new URL(
          `${client.apiBase}/transactions/${tx.hash}/synced/v1`
        )
        const headers: AxiosRequestHeaders = {
          'x-rkc-version': version,
        }

        if (client?.apiKey) {
          headers['x-api-key'] = client.apiKey
        }

        if (client?.uiVersion) {
          request.headers['x-rkui-version'] = client.uiVersion
        }

        await pollUntilOk(
          {
            url: confirmationUrl.href,
            method: 'get',
            headers: headers,
          },
          (res) => res && res.data.synced
        )

        if (
          json.steps
            .slice(incompleteStepIndex + 1)
            .findIndex((step) => step.kind === 'transaction') === -1
        ) {
          //Confirm that on-chain tx has been picked up by the indexer for the last transaction
          if (stepItem.txHash && (isSell || isBuy)) {
            const indexerConfirmationUrl = new URL(`${client.apiBase}/sales/v3`)
            const queryParams: paths['/sales/v3']['get']['parameters']['query'] =
              {
                txHash: stepItem.txHash,
              }
            setParams(indexerConfirmationUrl, queryParams)
            await pollUntilOk(
              {
                url: indexerConfirmationUrl.href,
                method: 'get',
                headers: headers,
              },
              (res) => {
                if (res.status === 200) {
                  const data =
                    res.data as paths['/sales/v3']['get']['responses']['200']['schema']
                  return data.sales && data.sales.length > 0 ? true : false
                }
                return false
              }
            )
          }
        }

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
            request.params = {
              ...request.params,
              signature,
            }
          }
        }

        if (postData) {
          const postOrderUrl = new URL(`${client.apiBase}${postData.endpoint}`)

          try {
            const getData = async function () {
              const headers: AxiosRequestHeaders = {
                'Content-Type': 'application/json',
                'x-rkc-version': version,
              }
              if (client?.apiKey) {
                headers['x-api-key'] = client.apiKey
              }

              let response = await axios.post(
                postOrderUrl.href,
                JSON.stringify(postData.body),
                {
                  method: postData.method,
                  headers,
                  params: request.params,
                }
              )

              return response
            }

            const res = await getData()

            if (res.status > 299 || res.status < 200) throw res.data

            stepItem.orderId = res.data.orderId
            setState([...json?.steps])
          } catch (err) {
            json.steps[incompleteStepIndex].error =
              'Your order could not be posted.'
            setState([...json?.steps])
            throw err
          }
        }

        break
      }

      default:
        break
    }

    delete step.message
    stepItem.status = 'complete'

    // Recursively call executeSteps()
    await executeSteps(request, signer, setState, json)
  } catch (err: any) {
    const error = new Error(err?.message)
    console.error(error)
    throw err
  }
}
