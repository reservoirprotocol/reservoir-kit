import { getClient } from '@reservoir0x/reservoir-sdk'
import * as React from 'react'
import { CreditCardProviders } from '../../hooks/useCreditCardProvider'
import getChainBlockExplorerUrl from '../../lib/getChainBlockExplorerUrl'
import { truncateAddress } from '../../lib/truncate'
import { Token } from '../../modal/buy/BuyModalRenderer'
import { Anchor, Flex, Text } from '../../primitives'

interface ErrorStateProps {
  provider: CreditCardProviders
  txHash: string | null
  token: Token['token'] | null
}

const ErrorState: React.FC<ErrorStateProps> = ({
  provider,
  txHash = '',
  token,
}) => {
  const chainId = getClient().currentChain()?.id || 1

  const blockExplorerBaseUrl = getChainBlockExplorerUrl(chainId)

  return (
    <Flex
      direction="column"
      justify="center"
      align="center"
      css={{ gap: '12px', mt: '24px' }}
    >
      <Text style="h5">Transaction Failed.</Text>
      <Text
        css={{
          textAlign: 'center',
        }}
      >
        Your purchase to buy {token?.name} has failed. Please contact {'  '}
        {provider} for support.
      </Text>
      {txHash && (
        <Anchor
          href={`${blockExplorerBaseUrl}/tx/${txHash}`}
          color="primary"
          weight="medium"
          target="_blank"
          css={{ fontSize: 12, mt: '24px' }}
        >
          View transaction {truncateAddress(txHash)}
        </Anchor>
      )}
    </Flex>
  )
}

export default ErrorState
