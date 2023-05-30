import { Execute, paths } from '../types'
import { pollUntilHasData, pollUntilOk } from './pollApi'
import { Account, WalletClient, toBytes } from 'viem'
import { axios } from '../utils'
import { AxiosRequestConfig, AxiosRequestHeaders } from 'axios'
import { getClient } from '../actions/index'
import { setParams } from './params'
import { version } from '../../package.json'
import { LogLevel } from '../utils/logger'
import { generateEvent } from '../utils/events'
import { sendTransactionSafely } from './transaction'

function checkExpectedPrice(
  quote: number,
  isSell: boolean,
  isBuy: boolean,
  expectedPrice?: number
) {
  let error: null | Error | { type: string; message: string } = null
  if (expectedPrice === undefined) {
    error = {
      type: 'price mismatch',
      message: `Attention: the offer price of this token is now ${quote}`,
    }
    return
  }

  // Check if the user is selling
  if (isSell && Number((quote - expectedPrice).toFixed(6)) < -0.00001) {
    error = {
      type: 'price mismatch',
      message: `Attention: the offer price of this token is now ${quote}`,
    }
  }

  // Check if the user is buying
  if (isBuy && Number((quote - expectedPrice).toFixed(6)) > 0.00001) {
    error = {
      type: 'price mismatch',
      message: `Attention: the price of this token is now ${quote}`,
    }
  }
  return error
}

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
 * @param newJson Data passed around, which contains steps and items etc
 * @param expectedPrice Expected price to check for price moves before starting to process the steps.
 * Can be a number or an object representing currency contract address to expected price
 * @returns A promise you can await on
 */

export async function executeSteps(
  request: AxiosRequestConfig,
  signer: WalletClient,
  setState: (steps: Execute['steps'], path: Execute['path']) => any,
  newJson?: Execute,
  expectedPrice?: number | Record<string, number>
) {
  const client = getClient()
  const currentReservoirChain = client?.currentChain()
  let json = newJson
  try {
    if (!request.headers) {
      request.headers = {}
    }

    if (currentReservoirChain?.baseApiUrl) {
      request.baseURL = currentReservoirChain.baseApiUrl
    }
    if (currentReservoirChain?.apiKey) {
      request.headers['x-api-key'] = currentReservoirChain.apiKey
    }
    if (client?.uiVersion) {
      request.headers['x-rkui-version'] = client.uiVersion
    }
    request.headers['x-rkc-version'] = version

    if (!json) {
      client.log(['Execute Steps: Fetching Steps', request], LogLevel.Verbose)
      const res = await axios.request(request)
      json = res.data as Execute
      if (res.status !== 200) throw json
      client.log(['Execute Steps: Steps retrieved', json], LogLevel.Verbose)
    }

    // Handle errors
    if (json.error || !json.steps) throw json

    const isBuy = request.url?.includes('/execute/buy') || false
    const isSell = request.url?.includes('/execute/sell') || false

    // Handle price changes to protect users from paying more
    // than expected when buying and selling for less than expected
    const path = json.path as {
      quote?: number //This is the quote, matching the order currency
      buyInQuote?: number //This is the "Buy In" quote, when converting to a currency to buy an order in
      currency?: string
    }[]
    if (path && expectedPrice) {
      client.log(
        [
          'Execute Steps: checking expected price',
          'expected price',
          expectedPrice,
          'path',
          path,
        ],
        LogLevel.Verbose
      )
      let error: ReturnType<typeof checkExpectedPrice>
      if (typeof expectedPrice === 'number') {
        const quote = path.reduce((total: number, { quote, buyInQuote }) => {
          total += buyInQuote || quote || 0
          return total
        }, 0)
        error = checkExpectedPrice(quote, isSell, isBuy, expectedPrice)
      } else {
        const quotes: Record<string, number> = path.reduce(
          (quotes, { quote, buyInQuote, currency }) => {
            if (currency) {
              if (!quotes[currency]) {
                quotes[currency] = buyInQuote || quote || 0
              } else {
                quotes[currency] += buyInQuote || quote || 0
              }
            }
            return quotes
          },
          {} as Record<string, number>
        )
        const quoteEntries = Object.entries(quotes)
        for (let i = 0; i < quoteEntries.length; i++) {
          const [currency, quote] = quoteEntries[i]
          error = checkExpectedPrice(
            quote,
            isSell,
            isBuy,
            expectedPrice[currency]
          )
          if (error) {
            break
          }
        }
      }

      if (error) {
        json.steps[0].error = error.message
        json.steps[0].errorData = json.path
        setState([...json?.steps], path)
        throw error
      }
    }

    // Update state on first call or recursion
    setState([...json?.steps], path)

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
    if (incompleteStepIndex === -1) {
      client.log(['Execute Steps: all steps complete'], LogLevel.Verbose)
      client._sendEvent(
        generateEvent(request, json),
        currentReservoirChain?.id || 1
      )
      return
    }

    const step = json.steps[incompleteStepIndex]
    let stepItems = json.steps[incompleteStepIndex].items

    if (!stepItems) {
      client.log(
        ['Execute Steps: skipping step, no items in step'],
        LogLevel.Verbose
      )
      return
    }

    let { kind } = step
    let stepItem = stepItems[incompleteStepItemIndex]
    // If step item is missing data, poll until it is ready
    if (!stepItem.data) {
      client.log(
        ['Execute Steps: step item data is missing, begin polling'],
        LogLevel.Verbose
      )
      json = (await pollUntilHasData(request, (json) => {
        client.log(
          ['Execute Steps: step item data is missing, polling', json],
          LogLevel.Verbose
        )
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
      ) {
        throw json
      }
      stepItems = items
      stepItem = items[incompleteStepItemIndex]
      setState([...json?.steps], path)
    }
    client.log(
      [`Execute Steps: Begin processing step items for: ${step.action}`],
      LogLevel.Verbose
    )

    const promises = stepItems
      .filter((stepItem) => stepItem.status === 'incomplete')
      .map((stepItem) => {
        return new Promise(async (resolve, reject) => {
          try {
            const stepData = stepItem.data

            if (!json) {
              return
            }
            // Handle each step based on it's kind
            switch (kind) {
              // Make an on-chain transaction
              case 'transaction': {
                client.log(
                  [
                    'Execute Steps: Begin transaction step for, sending transaction',
                  ],
                  LogLevel.Verbose
                )

                await sendTransactionSafely(
                  currentReservoirChain?.id || 1,
                  stepData,
                  signer,
                  (tx) => {
                    client.log(
                      ['Execute Steps: Transaction step, got transaction', tx],
                      LogLevel.Verbose
                    )
                    stepItem.txHash = tx
                    if (json) {
                      setState([...json.steps], path)
                    }
                  }
                )
                client.log(
                  [
                    'Execute Steps: Transaction finished, starting to poll for confirmation',
                  ],
                  LogLevel.Verbose
                )

                //Implicitly poll the confirmation url to confirm the transaction went through
                const confirmationUrl = new URL(
                  `${request.baseURL}/transactions/${stepItem.txHash}/synced/v1`
                )
                const headers: AxiosRequestHeaders = {
                  'x-rkc-version': version,
                }

                if (request.headers && request.headers['x-api-key']) {
                  headers['x-api-key'] = request.headers['x-api-key']
                }

                if (request.headers && client?.uiVersion) {
                  request.headers['x-rkui-version'] = client.uiVersion
                }
                await pollUntilOk(
                  {
                    url: confirmationUrl.href,
                    method: 'get',
                    headers: headers,
                  },
                  (res) => {
                    client.log(
                      ['Execute Steps: Polling for confirmation', res],
                      LogLevel.Verbose
                    )
                    return res && res.data.synced
                  }
                )

                //Confirm that on-chain tx has been picked up by the indexer
                if (
                  step.id === 'sale' &&
                  stepItem.txHash &&
                  (isSell || isBuy)
                ) {
                  client.log(
                    [
                      'Execute Steps: Polling sales to verify transaction was indexed',
                    ],
                    LogLevel.Verbose
                  )
                  const indexerConfirmationUrl = new URL(
                    `${request.baseURL}/sales/v4`
                  )
                  const queryParams: paths['/sales/v4']['get']['parameters']['query'] =
                    {
                      txHash: stepItem.txHash,
                    }
                  setParams(indexerConfirmationUrl, queryParams)
                  let salesData: paths['/sales/v4']['get']['responses']['200']['schema'] =
                    {}
                  await pollUntilOk(
                    {
                      url: indexerConfirmationUrl.href,
                      method: 'get',
                      headers: headers,
                    },
                    (res) => {
                      client.log(
                        [
                          'Execute Steps: Polling sales to check if indexed',
                          res,
                        ],
                        LogLevel.Verbose
                      )
                      if (res.status === 200) {
                        salesData = res.data
                        return salesData.sales && salesData.sales.length > 0
                          ? true
                          : false
                      }
                      return false
                    }
                  )
                  stepItem.salesData = salesData.sales
                  setState([...json?.steps], path)
                }

                break
              }

              // Sign a message
              case 'signature': {
                let signature: string | undefined
                const signData = stepData['sign']
                const postData = stepData['post']
                client.log(
                  ['Execute Steps: Begin signature step'],
                  LogLevel.Verbose
                )
                if (signData) {
                  // Request user signature
                  if (signData.signatureKind === 'eip191') {
                    client.log(
                      ['Execute Steps: Signing with eip191'],
                      LogLevel.Verbose
                    )
                    if (signData.message.match(/0x[0-9a-fA-F]{64}/)) {
                      // If the message represents a hash, we need to convert it to raw bytes first
                      signature = await signer.signMessage({
                        account: signer.account as Account,
                        message: toBytes(signData.message).toString(),
                      })
                    } else {
                      signature = await signer.signMessage({
                        account: signer.account as Account,
                        message: signData.message,
                      })
                    }
                  } else if (signData.signatureKind === 'eip712') {
                    client.log(
                      ['Execute Steps: Signing with eip712'],
                      LogLevel.Verbose
                    )
                    signature = await signer.signTypedData({
                      account: signer.account as Account,
                      domain: signData.domain,
                      types: signData.types,
                      primaryType: signData.primaryType,
                      message: signData.value,
                    })
                  }

                  if (signature) {
                    request.params = {
                      ...request.params,
                      signature,
                    }
                  }
                }

                if (postData) {
                  client.log(['Execute Steps: Posting order'], LogLevel.Verbose)
                  const postOrderUrl = new URL(
                    `${request.baseURL}${postData.endpoint}`
                  )

                  try {
                    const getData = async function () {
                      const headers: AxiosRequestHeaders = {
                        'Content-Type': 'application/json',
                        'x-rkc-version': version,
                      }
                      if (request.headers && request.headers['x-api-key']) {
                        headers['x-api-key'] = request.headers['x-api-key']
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

                    if (res.data.results) {
                      stepItem.orderData = res.data.results
                    } else if (res.data && res.data.orderId) {
                      stepItem.orderData = [
                        {
                          orderId: res.data.orderId,
                          crossPostingOrderId: res.data.crossPostingOrderId,
                          orderIndex: res.data.orderIndex || 0,
                        },
                      ]
                    }
                    setState([...json?.steps], path)
                  } catch (err) {
                    throw err
                  }
                }

                break
              }

              default:
                break
            }
            stepItem.status = 'complete'
            setState([...json?.steps], path)
            resolve(stepItem)
          } catch (e) {
            const error = e as Error
            const errorMessage = error
              ? error.message
              : 'Error: something went wrong'

            if (error && json?.steps) {
              json.steps[incompleteStepIndex].error = errorMessage
              stepItem.error = errorMessage
              setState([...json?.steps], path)
            }
            reject(error)
          }
        })
      })

    await Promise.all(promises)

    // Recursively call executeSteps()
    await executeSteps(request, signer, setState, json)
  } catch (err: any) {
    let blockNumber = 0
    try {
      blockNumber = (await signer.provider?.getBlockNumber()) || 0
    } catch (blockError) {
      client.log(
        ['Execute Steps: Failed to get block number', blockError],
        LogLevel.Error
      )
    }
    client.log(
      ['Execute Steps: An error occurred', err, 'Block Number:', blockNumber],
      LogLevel.Error
    )
    const error = err as Error
    const errorMessage = error ? error.message : 'Error: something went wrong'

    if (json) {
      json.error = errorMessage
      setState([...json?.steps], json.path)
    }

    client._sendEvent(
      generateEvent(request, json),
      currentReservoirChain?.id || 1
    )

    throw err
  }
}
