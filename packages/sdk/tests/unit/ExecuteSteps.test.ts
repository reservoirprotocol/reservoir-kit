import {
  createClient,
  Execute,
  executeSteps,
  ReservoirClient,
} from '@reservoir0x/reservoir-sdk'
import { createWalletClient, http, WalletClient } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'

const wallet: WalletClient = createWalletClient({
  account: privateKeyToAccount(
    '0xbe3daafa8b8f52645fb72e74689b5b35875c80d5de4c79506a341523fc480cfa'
  ),
  chain: mainnet,
  transport: http(),
})

createClient({
  chains: [
    {
      id: 1,
      baseApiUrl: 'https://api.reservoir.tools',
      active: true,
    },
  ],
  logLevel: 0,
}) as ReservoirClient

const signMessage = wallet.signMessage.bind(wallet)
const signTypedData = wallet.signTypedData.bind(wallet)

const signMessageSpy = jest
  .spyOn(wallet, 'signMessage')
  .mockImplementation((...args) => {
    return signMessage(...args)
  })

const signTypedDataSpy = jest
  .spyOn(wallet, 'signTypedData')
  .mockImplementation((...args) => {
    return signTypedData(...args)
  })

describe(`It should test the executeStepsMethod.`, (): void => {
  test('Shold execute EIP712 method.', (): Promise<void> => {
    return executeSteps({}, wallet, (steps: Execute['steps']) => {}, {
      steps: [
        {
          id: 'order-signature',
          action: 'Authorize listing',
          description: 'A free off-chain signature to create the listing',
          kind: 'signature',
          items: [
            {
              status: 'incomplete',
              data: {
                sign: {
                  signatureKind: 'eip712',
                  domain: {
                    name: 'Seaport',
                    version: '1.5',
                    chainId: 137,
                    verifyingContract:
                      '0x00000000000000adc04c56bf30ac9d3c0aaf14dc',
                  },
                  types: {
                    OrderComponents: [
                      {
                        name: 'offerer',
                        type: 'address',
                      },
                      {
                        name: 'zone',
                        type: 'address',
                      },
                      {
                        name: 'offer',
                        type: 'OfferItem[]',
                      },
                      {
                        name: 'consideration',
                        type: 'ConsiderationItem[]',
                      },
                      {
                        name: 'orderType',
                        type: 'uint8',
                      },
                      {
                        name: 'startTime',
                        type: 'uint256',
                      },
                      {
                        name: 'endTime',
                        type: 'uint256',
                      },
                      {
                        name: 'zoneHash',
                        type: 'bytes32',
                      },
                      {
                        name: 'salt',
                        type: 'uint256',
                      },
                      {
                        name: 'conduitKey',
                        type: 'bytes32',
                      },
                      {
                        name: 'counter',
                        type: 'uint256',
                      },
                    ],
                    OfferItem: [
                      {
                        name: 'itemType',
                        type: 'uint8',
                      },
                      {
                        name: 'token',
                        type: 'address',
                      },
                      {
                        name: 'identifierOrCriteria',
                        type: 'uint256',
                      },
                      {
                        name: 'startAmount',
                        type: 'uint256',
                      },
                      {
                        name: 'endAmount',
                        type: 'uint256',
                      },
                    ],
                    ConsiderationItem: [
                      {
                        name: 'itemType',
                        type: 'uint8',
                      },
                      {
                        name: 'token',
                        type: 'address',
                      },
                      {
                        name: 'identifierOrCriteria',
                        type: 'uint256',
                      },
                      {
                        name: 'startAmount',
                        type: 'uint256',
                      },
                      {
                        name: 'endAmount',
                        type: 'uint256',
                      },
                      {
                        name: 'recipient',
                        type: 'address',
                      },
                    ],
                  },
                  value: {
                    kind: 'single-token',
                    offerer: '0xd6044091d0b41efb3402ca05ba4068f969fdd9e4',
                    zone: '0x0000000000000000000000000000000000000000',
                    offer: [
                      {
                        itemType: 3,
                        token: '0x22d5f9b75c524fec1d6619787e582644cd4d7422',
                        identifierOrCriteria: '606',
                        startAmount: '1',
                        endAmount: '1',
                      },
                    ],
                    consideration: [
                      {
                        itemType: 0,
                        token: '0x0000000000000000000000000000000000000000',
                        identifierOrCriteria: '0',
                        startAmount: '950000000000000000',
                        endAmount: '950000000000000000',
                        recipient: '0xd6044091d0b41efb3402ca05ba4068f969fdd9e4',
                      },
                      {
                        itemType: 0,
                        token: '0x0000000000000000000000000000000000000000',
                        identifierOrCriteria: '0',
                        startAmount: '50000000000000000',
                        endAmount: '50000000000000000',
                        recipient: '0xb7265b71faf21454769921cb99f3598650cec685',
                      },
                    ],
                    orderType: 1,
                    startTime: 1685637296,
                    endTime: 1701189356,
                    zoneHash:
                      '0x0000000000000000000000000000000000000000000000000000000000000000',
                    salt: '13254255466736121242604385311749142315338787210280252868977482787632309762060',
                    conduitKey:
                      '0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000',
                    counter: '0',
                    signature:
                      '0x0000000000000000000000000000000000000000000000000000000000000000',
                  },
                  primaryType: 'OrderComponents',
                },
                post: {
                  endpoint: '/order/v3',
                  method: 'POST',
                  body: {
                    order: {
                      kind: 'seaport-v1.5',
                      data: {
                        kind: 'single-token',
                        offerer: '0xd6044091d0b41efb3402ca05ba4068f969fdd9e4',
                        zone: '0x0000000000000000000000000000000000000000',
                        offer: [
                          {
                            itemType: 3,
                            token: '0x22d5f9b75c524fec1d6619787e582644cd4d7422',
                            identifierOrCriteria: '606',
                            startAmount: '1',
                            endAmount: '1',
                          },
                        ],
                        consideration: [
                          {
                            itemType: 0,
                            token: '0x0000000000000000000000000000000000000000',
                            identifierOrCriteria: '0',
                            startAmount: '950000000000000000',
                            endAmount: '950000000000000000',
                            recipient:
                              '0xd6044091d0b41efb3402ca05ba4068f969fdd9e4',
                          },
                          {
                            itemType: 0,
                            token: '0x0000000000000000000000000000000000000000',
                            identifierOrCriteria: '0',
                            startAmount: '50000000000000000',
                            endAmount: '50000000000000000',
                            recipient:
                              '0xb7265b71faf21454769921cb99f3598650cec685',
                          },
                        ],
                        orderType: 1,
                        startTime: 1685637296,
                        endTime: 1701189356,
                        zoneHash:
                          '0x0000000000000000000000000000000000000000000000000000000000000000',
                        salt: '13254255466736121242604385311749142315338787210280252868977482787632309762060',
                        conduitKey:
                          '0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000',
                        counter: '0',
                        signature:
                          '0x0000000000000000000000000000000000000000000000000000000000000000',
                      },
                    },
                    orderbook: 'reservoir',
                  },
                },
              },
              orderIndexes: [0],
            },
          ],
        },
      ],
      path: {} as any,
      /**
       * We can't stop the request being sent. So what we do is check if it's an axios error.
       * If it is, then the error that executeSteps threw was due to a bad request made after we tested the data.
       * If it isn't, then the error is likely a jest or node exception.
       */
    }).catch((e: Error) => {
      expect(signTypedDataSpy).toBeCalled()
      if (e.name !== 'AxiosError') throw e
    })
  })
  test('Should execute EIP191 method.', (): Promise<void> => {
    return executeSteps({}, wallet, (steps: Execute['steps']) => {}, {
      steps: [
        {
          id: 'auth',
          action: 'Sign in to Blur',
          description:
            'Some marketplaces require signing an auth message before filling',
          kind: 'signature',
          items: [
            {
              status: 'incomplete',
              data: {
                sign: {
                  signatureKind: 'eip191',
                  message:
                    'Sign in to Blur\n\nChallenge: 734acb6851ba66f83188d8e34c3c8719c1e89e9f8e067c028955581bfde860a8',
                },
                post: {
                  endpoint: '/execute/auth-signature/v1',
                  method: 'POST',
                  body: {
                    kind: 'blur',
                    id: 'blur-auth-challenge:0x00000000219ab540356cbb839cbe05303d7705fa',
                  },
                },
              },
            },
          ],
        },
        {
          id: 'currency-approval',
          action: 'Approve exchange contract',
          description: 'A one-time setup transaction to enable trading',
          kind: 'transaction',
          items: [
            {
              status: 'incomplete',
            },
          ],
        },
        {
          id: 'sale',
          action: 'Confirm transaction in your wallet',
          description:
            'To purchase this item you must confirm the transaction and pay the gas fee',
          kind: 'transaction',
          items: [],
        },
      ],
      path: [
        {
          orderId:
            '0x6ea6242390c7192b633d7f094f23ea9d905d3863c97a7cb8208a9c87d8cc9fb2',
          contract: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
          tokenId: '6117',
          quantity: 1,
          source: 'blur.io',
          currency: '0x0000000000000000000000000000000000000000',
          currencySymbol: 'ETH',
          currencyDecimals: 18,
          quote: 47,
          rawQuote: '47000000000000000000',
          builtInFees: [
            {
              bps: 50,
              kind: 'royalty',
              recipient: '0xa858ddc0445d8131dac4d1de01f834ffcba52ef1',
              amount: 0.235,
              rawAmount: '235000000000000000',
            },
          ],
          feesOnTop: [],
          totalPrice: 47,
          totalRawPrice: '47000000000000000000',
        },
      ],
    }).catch((e: Error) => {
      expect(signMessageSpy).toBeCalled()
      if (e.name !== 'AxiosError') throw e
    })
  })
})

export {}
