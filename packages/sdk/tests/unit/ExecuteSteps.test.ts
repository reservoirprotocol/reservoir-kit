import { createClient, Execute } from '@reservoir0x/reservoir-sdk'
import { Signer, utils } from 'ethers'

/**
 * Reservoir Kit SDK client
 */
const client = createClient({
  chains: [
    {
      baseApiUrl: 'https://api-polygon.reservoir.tools',
      id: 137,
      active: true,
      apiKey: '',
    },
  ],
})
/**
 * Mocksigner object for ethers.
 */
const mockSigner: Signer = {
  getAddress: jest
    .fn()
    .mockResolvedValue('0xD6044091d0b41EFB3402CA05bA4068F969FdD9e4'), // A typical Ethereum address
  getBalance: jest.fn().mockResolvedValue(utils.parseEther('10')), // You've already got this
  signMessage: jest
    .fn()
    .mockResolvedValue(
      '0x1234567890123456789012345678901234567890123456789012345678901234'
    ), // A typical signed message
  signTransaction: jest
    .fn()
    .mockResolvedValue(
      '0x1234567890123456789012345678901234567890123456789012345678901234'
    ), // A typical signed transaction
  connect: jest.fn().mockReturnThis(), // This function typically returns the instance itself
  getTransactionCount: jest.fn().mockResolvedValue(10), // Number of transactions made by this address
  estimateGas: jest.fn().mockResolvedValue(utils.parseEther('1')), // Gas estimation for a transaction
  call: jest.fn().mockResolvedValue('0x123456'), // Typical response from a contract call
  sendTransaction: jest.fn().mockResolvedValue({
    hash: '0x1234567890123456789012345678901234567890123456789012345678901234',
  }), // Transaction hash of the sent transaction
  getChainId: jest.fn().mockResolvedValue(1), // Chain ID, 1 for Ethereum Mainnet
  getGasPrice: jest.fn().mockResolvedValue(utils.parseEther('1')), // Current gas price
  getFeeData: jest.fn().mockResolvedValue({
    gasPrice: utils.parseEther('1'),
    maxFeePerGas: 10000000000,
    maxPriorityFeePerGas: 1000000000,
  }), // Current gas price and suggested max fees
  resolveName: jest
    .fn()
    .mockResolvedValue('0x1234567890123456789012345678901234567890'), // Resolved address from ENS name
  checkTransaction: jest.fn().mockResolvedValue({
    blockHash:
      '0x1234567890123456789012345678901234567890123456789012345678901234',
    blockNumber: 1234567,
    confirmations: 10,
  }), // Transaction receipt details
  populateTransaction: jest.fn().mockResolvedValue({
    nonce: 123,
    gasLimit: 21000,
    gasPrice: utils.parseEther('1'),
    data: '0x123456',
  }), // Populated transaction
  _isSigner: false,
  _checkProvider: jest.fn().mockResolvedValue({}), // Typically returns the provider itself
}

describe(`It should test the executeStepsMethod.`, (): void => {
  test('Shold execute and return step data for listing a token.', async (): Promise<
    Execute['steps'] | boolean
  > => {
    const data: Parameters<typeof client['actions']['listToken']>['0'] = {
      listings: [
        {
          token: `0x22d5f9b75c524fec1d6619787e582644cd4d7422:606`,
          quantity: 1,
          weiPrice: '1000000000000000000',
          orderbook: 'reservoir',
          orderKind: 'seaport-v1.5',
        },
      ],
      signer: mockSigner,
    }
    return client.actions
      .listToken({
        listings: data['listings'],
        signer: mockSigner,
        precheck: true,
      })
      .then((data: any) => {
        const steps = data as Execute['steps']

        const ids = Array.from(steps.map((step) => step.id))

        expect(ids).toContain('nft-approval')
        expect(ids).toContain('order-signature')

        return steps
      })
      .catch((e: unknown) => {
        throw e
      })
  })

  test('Shold execute and return step data for cancelling a token.', async (): Promise<void> => {})

  test('Shold execute and return step data for purchasing a token.', async (): Promise<void> => {})
})

export {}
