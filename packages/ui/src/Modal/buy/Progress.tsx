import { Anchor, Flex, Text } from '../../primitives'
import React, { FC } from 'react'
import { BuyStep } from './BuyModal'
import confirmingProgress from 'data-url:../../../assets/confirmingProgress.gif'
import finalizingProgress from 'data-url:../../../assets/finalizingProgress.gif'

type Props = {
  buyStep: BuyStep
  txHash?: string
}

export const Progress: FC<Props> = ({ buyStep, txHash }) => {
  //todo read currently connected to chain
  const etherscanBaseUrl = 'https://etherscan.io/tx'

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
      {buyStep == BuyStep.Confirming && (
        <>
          <Text style="h6">Confirm Transaction in your wallet</Text>
          <img style={{ height: 100 }} src={confirmingProgress} />
        </>
      )}

      {buyStep == BuyStep.Finalizing && (
        <>
          <Text style="h6">Finalizing on blockchain</Text>
          <img style={{ height: 100 }} src={finalizingProgress} />
        </>
      )}
      <Anchor
        color="primary"
        weight="medium"
        css={{
          fontSize: 12,
          visibility: buyStep == BuyStep.Finalizing ? 'visible' : 'hidden',
        }}
        href={`${etherscanBaseUrl}/${txHash}`}
        target="_blank"
      >
        View on Etherscan
      </Anchor>
    </Flex>
  )
}
