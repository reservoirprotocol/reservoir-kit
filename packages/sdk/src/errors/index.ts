export class TransactionTimeoutError extends Error {
  txHash: `0x${string}`
  blockExplorerBaseUrl?: string

  constructor(
    txHash: `0x${string}`,
    attemptCount: number,
    blockExplorerBaseUrl?: string
  ) {
    super(
      `Failed to receive a successful response for transaction with hash '${txHash}' after ${attemptCount} attempt(s).`
    )
    this.name = 'TransactionTimeoutError'
    this.txHash = txHash
    this.blockExplorerBaseUrl = blockExplorerBaseUrl
  }
}

export class CrossChainTransactionError extends Error {
  constructor() {
    super(
      'Cross-chain purchase failed, please try again. Your balance can be used for another purchase. For assistance or withdrawal help, please contact Reservoir.'
    )
    this.name = 'CrossChainTransactionError'
  }
}
