import { Anchor, Flex, Text } from '../../primitives'
import React, { FC } from 'react'
// @ts-ignore
import confirmingProgress from 'url:../../../assets/confirmingProgress.gif'
// @ts-ignore
import finalizingProgress from 'url:../../../assets/finalizingProgress.gif'

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
      <img
        style={{ height: 100 }}
        src={txHash ? finalizingProgress : confirmingProgress}
      />
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
