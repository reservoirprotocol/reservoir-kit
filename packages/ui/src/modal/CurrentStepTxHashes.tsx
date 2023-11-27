import React, { FC } from 'react'
import { Execute } from '@reservoir0x/reservoir-sdk'
import { truncateAddress } from '../lib/truncate'
import getChainBlockExplorerUrl from '../lib/getChainBlockExplorerUrl'
import { Anchor, Flex } from '../primitives'
import { CSS } from '@stitches/react'

type CurrentStepTxHashesProps = {
  currentStep?: Execute['steps'][0]
  css?: CSS
}

export const CurrentStepTxHashes: FC<CurrentStepTxHashesProps> = ({
  currentStep,
  css,
}) => {
  const hasValidTxHashes = currentStep?.items?.some(
    (item) =>
      (Array.isArray(item?.txHashes) && item.txHashes.length > 0) ||
      (Array.isArray(item?.internalTxHashes) &&
        item.internalTxHashes.length > 0)
  )

  // Return null if there are no valid txHashes or internalTxHashes
  if (!hasValidTxHashes) {
    return null
  }
  return (
    <Flex
      direction="column"
      align="center"
      css={{ width: '100%', gap: '$2', mb: '$3', px: '$5', ...css }}
    >
      {currentStep?.items?.map((item, itemIndex) => {
        // Check if txHashes and internalTxHashes arrays are valid and merge them
        const validTxHashes =
          Array.isArray(item?.txHashes) && item?.txHashes.length > 0
            ? item.txHashes
            : []
        const validInternalTxHashes =
          Array.isArray(item?.internalTxHashes) &&
          item?.internalTxHashes.length > 0
            ? item.internalTxHashes
            : []
        const allTxHashes = [...validTxHashes, ...validInternalTxHashes]
        if (allTxHashes?.length > 0) {
          return allTxHashes?.map((hash, txHashIndex) => {
            const truncatedTxHash = truncateAddress(hash.txHash)
            const blockExplorerBaseUrl = getChainBlockExplorerUrl(hash.chainId)
            return (
              <Anchor
                key={`${itemIndex}-${txHashIndex}`}
                href={`${blockExplorerBaseUrl}/tx/${hash.txHash}`}
                color="primary"
                weight="medium"
                target="_blank"
                css={{ fontSize: 12 }}
              >
                View transaction: {truncatedTxHash}
              </Anchor>
            )
          })
        } else {
          return null
        }
      })}
    </Flex>
  )
}
