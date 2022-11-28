import { Anchor, Box, Flex, Text } from '../../primitives'
import React, { FC } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCube, faWallet } from '@fortawesome/free-solid-svg-icons'

type Props = {
  title: string
  txHash?: string
  etherscanBaseUrl?: string
}

export const Progress: FC<Props> = ({ title, txHash, etherscanBaseUrl }) => {
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
        href={etherscanBaseUrl}
        target="_blank"
      >
        View on Etherscan
      </Anchor>
    </Flex>
  )
}
