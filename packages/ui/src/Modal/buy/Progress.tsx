import { Anchor, Flex, Text } from '../../primitives'
import React, { FC } from 'react'
import { BuyStep } from './BuyModalRenderer'
import confirmingProgress from 'url:../../../assets/confirmingProgress.gif'
import finalizingProgress from 'url:../../../assets/finalizingProgress.gif'

type Props = {
  buyStep: BuyStep
  etherscanBaseUrl?: string
}

export const Progress: FC<Props> = ({ buyStep, etherscanBaseUrl }) => {
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
          <Text style="h6">Confirm transaction in your wallet</Text>
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
        href={etherscanBaseUrl}
        target="_blank"
      >
        View on Etherscan
      </Anchor>
    </Flex>
  )
}
