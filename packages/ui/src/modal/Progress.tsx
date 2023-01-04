import { Anchor, Box, Flex, Text } from '../primitives'
import React, { FC } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCube, faWallet } from '@fortawesome/free-solid-svg-icons'
import { useNetwork } from 'wagmi'

type Props = {
  title: string
  txHash?: string
  blockExplorerBaseUrl?: string
}

const Progress: FC<Props> = ({ title, txHash, blockExplorerBaseUrl }) => {
  const { chain: activeChain } = useNetwork()

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
          icon={txHash ? faCube : faWallet}
          style={{
            width: '32px',
            height: '32px',
            marginTop: '12px 0px',
          }}
        />
      </Box>
      <Anchor
        color="primary"
        weight="medium"
        css={{
          fontSize: 12,
          visibility: txHash ? 'visible' : 'hidden',
        }}
        href={blockExplorerBaseUrl}
        target="_blank"
      >
        View on {activeChain?.blockExplorers?.default.name || 'Etherscan'}
      </Anchor>
    </Flex>
  )
}

export default Progress
