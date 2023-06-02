import {
  createClient,
  Execute,
  executeSteps,
  ReservoirClient,
} from '@reservoir0x/reservoir-sdk'
import axios from 'axios'
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
  logLevel: 4,
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

const sendTransactionSpy = jest
  .spyOn(wallet, 'sendTransaction')
  .mockImplementation((...args) => {
    /**
     * Return a Tx hash as to ensure that viem does not try to send this data.
     */
    return new Promise((resolve) =>
      resolve(
        '0x2446f1fd773fbb9f080e674b60c6a033c7ed7427b8b9413cf28a2a4a6da9b56c'
      )
    )
  })

jest.spyOn(axios, 'request').mockImplementation((...args) => {
  return new Promise((resolve) => {
    if (args[0].url?.includes('/synced/v1')) {
      resolve({
        data: {
          synced: true,
        },
        status: 200,
        statusText: '200',
        headers: {},
        config: {},
        request: null,
      })
    }
  })
})
jest.spyOn(axios, 'post').mockImplementation((...args) => {
  return new Promise((resolve) => {
    if (args[0].includes('/order/v3')) {
      resolve({
        data: {
          results: [
            {
              message: 'string',
              orderId: 'string',
              orderIndex: 0,
              crossPostingOrderId: 'string',
              crossPostingOrderStatus: 'string',
            },
          ],
        },
        status: 200,
        statusText: '200',
        headers: {},
        config: {},
        request: null,
      })
    }
    if (args[0].includes('/execute/auth-signature/v1')) {
      resolve({
        data: {
          auth: 'string',
        },
        status: 200,
        statusText: '200',
        headers: {},
        config: {},
        request: null,
      })
    }
  })
})

describe(`It should test the executeSteps Method.`, (): void => {
  test('Should execute signTypedDataSpy method.', (): Promise<void> => {
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
    })
      .then(() => {
        expect(signTypedDataSpy).toBeCalled()

        const firstArg = signTypedDataSpy.mock.calls[0][0]

        expect(firstArg).not.toBeNull()

        expect(firstArg).toEqual(
          expect.objectContaining({
            account: expect.objectContaining({
              address: '0xd12d92f6CFF9284D20d0dc99A4F256e63C5690c7',
              source: 'privateKey',
              type: 'local',
            }),
            domain: {
              name: 'Seaport',
              version: '1.5',
              chainId: 137,
              verifyingContract: '0x00000000000000adc04c56bf30ac9d3c0aaf14dc',
            },
            primaryType: 'OrderComponents',
          })
        )
        return
      })
      .catch((e: Error) => {
        throw e
      })
  })
  test('Should execute signMessageSpy method.', (): Promise<void> => {
    return executeSteps(
      {
        url: 'https://api.reservoir.tools/execute/auth-signature/v1',
        method: 'post',
        data: {
          kind: 'blur',
          id: 'blur-auth-challenge:0x00000000219ab540356cbb839cbe05303d7705fa',
        },
      },
      wallet,
      (steps: Execute['steps']) => {},
      {
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
        ],
        path: [],
      }
    )
      .then(() => {
        expect(signMessageSpy).toBeCalled()

        const firstArg = signMessageSpy.mock.calls[0][0]

        expect(firstArg).not.toBeNull()

        expect(firstArg).toEqual(
          expect.objectContaining({
            account: expect.objectContaining({
              address: '0xd12d92f6CFF9284D20d0dc99A4F256e63C5690c7',
              source: 'privateKey',
              type: 'local',
            }),
            message:
              'Sign in to Blur\n' +
              '\n' +
              'Challenge: 734acb6851ba66f83188d8e34c3c8719c1e89e9f8e067c028955581bfde860a8',
          })
        )
      })
      .catch((e: Error) => {
        throw e
      })
  })
  test('Should execute sendTransaction method.', (): Promise<void> => {
    return executeSteps({}, wallet, (steps: Execute['steps']) => {}, {
      steps: [
        {
          id: 'sale',
          action: 'Confirm transaction in your wallet',
          description:
            'To purchase this item you must confirm the transaction and pay the gas fee',
          kind: 'transaction',
          items: [
            {
              status: 'incomplete',
              orderIds: [
                '0x9db77ab93c65535e87b4a3922671fca06721bd84e96450fa6e8decf3b42c8759',
              ],
              data: {
                from: '0xd6044091d0b41efb3402ca05ba4068f969fdd9e4',
                to: '0x00000000000000adc04c56bf30ac9d3c0aaf14dc',
                data: '0xe7acab24000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000006200000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000003e8000000000000000000000000000000000000000000000000000000000000052000000000000000000000000000000000000000000000000000000000000005800000000000000000000000000b87fdff7252f01c35230588cdf2bee70a67c525000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001600000000000000000000000000000000000000000000000000000000000000220000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000647780f400000000000000000000000000000000000000000000000000000000649f0df40000000000000000000000000000000000000000000000000000000000000000360c6ebe00000000000000000000000000000000000000001afa5c27cfadd31f0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000003000000000000000000000000ba6666b118f8303f990f3519df07e160227cce87000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000003e800000000000000000000000000000000000000000000000000000000000003e800000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001e5b8fa8fe2ac0000000000000000000000000000000000000000000000000001e5b8fa8fe2ac0000000000000000000000000000b87fdff7252f01c35230588cdf2bee70a67c52500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a76400000000000000000000000000000000000000000000000000000de0b6b3a7640000000000000000000000000000000a26b00c1f0df003000390027140000faa71900000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003782dace9d9000000000000000000000000000000000000000000000000000003782dace9d90000000000000000000000000000b17e8166e683b592e32f46e27d2e093e8d4622a700000000000000000000000000000000000000000000000000000000000000403eb93a645bae63462e9f34780f30d9f29079d1239bef62b4d7a79805334f297f7ffde256297388602d9a7c9ccc20e55a27a8fd839eca9dd28e3bf79938ec3c6e000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001d4da48bdbe61192',
                value: '0x08e1bc9bf04000',
              },
            },
          ],
        },
      ],
      errors: [],
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
    })
      .then(() => {
        expect(sendTransactionSpy).toBeCalled()
        const firstArg = sendTransactionSpy.mock.calls[0][0]

        expect(firstArg).not.toBeNull()

        expect(firstArg).toEqual(
          expect.objectContaining({
            account: '0xd6044091d0b41efb3402ca05ba4068f969fdd9e4',
            to: '0x00000000000000adc04c56bf30ac9d3c0aaf14dc',
            value: '0x08e1bc9bf04000',
          })
        )
      })
      .catch((e: Error) => {
        throw e
      })
  })
})

export {}
