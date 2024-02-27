import { Anchor, Box, Flex, Text } from '../primitives'
import React, { FC, useMemo } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { truncateAddress } from '../lib/truncate'
import { Execute } from '@reservoir0x/reservoir-sdk'
import getChainBlockExplorerUrl from '../lib/getChainBlockExplorerUrl'

type Props = {
  title: string
  txHashes?: NonNullable<Execute['steps'][0]['items']>[0]['txHashes']
}

const Progress: FC<Props> = ({ title, txHashes }) => {
  const hasTxHashes = txHashes && txHashes.length > 0

  const enhancedTxHashes = useMemo(() => {
    return txHashes?.map((hash) => {
      const truncatedTxHash = truncateAddress(hash.txHash)
      const blockExplorerUrl = getChainBlockExplorerUrl(hash.chainId)
      return {
        txHash: hash.txHash,
        chainId: hash.chainId,
        truncatedTxHash: truncatedTxHash,
        blockExplorerUrl: blockExplorerUrl,
      }
    })
  }, [txHashes])

  return (
    <Flex
      direction="column"
      css={{
        alignItems: 'center',
        gap: '$4',
        mt: '$5',
        mb: '$3',
      }}
    >
      <Text style="h6">{title}</Text>
      <Box css={{ color: '$neutralText' }}>
        <FontAwesomeIcon
          icon={hasTxHashes ? 'cube' : 'wallet'}
          style={{
            width: '32px',
            height: '32px',
            marginTop: '12px 0px',
          }}
        />
      </Box>
      {hasTxHashes ? (
        <Flex direction="column" align="center" css={{ gap: '$2' }}>
          {enhancedTxHashes?.map((enhancedTxHash, index) => (
            <Anchor
              key={index}
              href={`${enhancedTxHash.blockExplorerUrl}/tx/${enhancedTxHash.txHash}`}
              color="primary"
              weight="medium"
              target="_blank"
              css={{ fontSize: 12 }}
            >
              View transaction: {enhancedTxHash.truncatedTxHash}
            </Anchor>
          ))}
        </Flex>
      ) : null}
    </Flex>
  )
}

export default Progress
