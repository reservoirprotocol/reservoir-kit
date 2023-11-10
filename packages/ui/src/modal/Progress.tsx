import { Anchor, Box, Flex, Text } from '../primitives'
import React, { FC } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCube, faWallet } from '@fortawesome/free-solid-svg-icons'
import { truncateAddress } from '../lib/truncate'
import { Execute } from '@reservoir0x/reservoir-sdk'
import getChainBlockExplorerUrl from '../lib/getChainBlockExplorerUrl'

type Props = {
  title: string
  txHashes?: NonNullable<Execute['steps'][0]['items']>[0]['txHashes']
}

const Progress: FC<Props> = ({ title, txHashes }) => {
  const hasTxHashes = txHashes && txHashes.length > 0

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
          icon={hasTxHashes ? faCube : faWallet}
          style={{
            width: '32px',
            height: '32px',
            marginTop: '12px 0px',
          }}
        />
      </Box>
      {hasTxHashes ? (
        <Flex direction="column" align="center" css={{ gap: '$2' }}>
          {txHashes?.map((hash, index) => {
            const truncatedTxHash = truncateAddress(hash.txHash)
            const blockExplorerBaseUrl = getChainBlockExplorerUrl(hash.chainId)
            return (
              <Anchor
                key={index}
                href={`${blockExplorerBaseUrl}/tx/${hash.txHash}`}
                color="primary"
                weight="medium"
                target="_blank"
                css={{ fontSize: 12 }}
              >
                View transaction: {truncatedTxHash}
              </Anchor>
            )
          })}
        </Flex>
      ) : null}
    </Flex>
  )
}

export default Progress
