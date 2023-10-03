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
