import {
  adaptViemWallet,
  createClient,
  Execute,
  executeSteps,
  ReservoirClient,
  axios
} from '@reservoir0x/reservoir-sdk'
import { createWalletClient, hexToBigInt, http, WalletClient } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'
import signatureStepDataEIP712 from '../data/signatureStepEIP712.json'
import signatureStepDataEIP191 from '../data/signatureStepEIP191.json'
import transactionStepData from '../data/transactionStep.json'

const viemWallet: WalletClient = createWalletClient({
  account: privateKeyToAccount(
    '0xbe3daafa8b8f52645fb72e74689b5b35875c80d5de4c79506a341523fc480cfa'
  ),
  chain: mainnet,
  transport: http(),
})

const wallet = adaptViemWallet(viemWallet)

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

const signMessage = viemWallet.signMessage.bind(wallet)
const signTypedData = viemWallet.signTypedData.bind(wallet)

const signMessageSpy = jest
  .spyOn(viemWallet, 'signMessage')
  .mockImplementation((...args) => {
    return signMessage(...args)
  })

const signTypedDataSpy = jest
  .spyOn(viemWallet, 'signTypedData')
  .mockImplementation((...args) => {
    return signTypedData(...args)
  })

const sendTransactionSpy = jest
  .spyOn(viemWallet, 'sendTransaction')
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
  test('Should execute signTypedDataSpy method (EIP712).', (): Promise<void> => {
    return executeSteps(
      {},
      wallet,
      (steps: Execute['steps']) => {},
      signatureStepDataEIP712 as any
    )
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
  test('Should execute signMessageSpy method (EIP191).', (): Promise<void> => {
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
      signatureStepDataEIP191 as any
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
    return executeSteps(
      {},
      wallet,
      (steps: Execute['steps']) => {},
      transactionStepData as any
    )
      .then(() => {
        expect(sendTransactionSpy).toBeCalled()
        const firstArg = sendTransactionSpy.mock.calls[0][0]

        expect(firstArg).not.toBeNull()

        expect(firstArg).toEqual(
          expect.objectContaining({
            account: viemWallet.account,
            to: '0x00000000000000adc04c56bf30ac9d3c0aaf14dc',
            value: hexToBigInt('0x08e1bc9bf04000'),
          })
        )
      })
      .catch((e: Error) => {
        throw e
      })
  })
})

export {}
