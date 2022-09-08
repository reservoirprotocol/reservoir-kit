import { Anchor, Flex, Text } from '../../primitives'
import React, { FC } from 'react'
import { AcceptOfferStep } from './AcceptOfferModalRenderer'
// @ts-ignore
import confirmingProgress from 'url:../../../assets/confirmingProgress.gif'
// @ts-ignore
import finalizingProgress from 'url:../../../assets/finalizingProgress.gif'

type Props = {
  acceptOfferStep: AcceptOfferStep
  etherscanBaseUrl?: string
}

export const Progress: FC<Props> = ({ acceptOfferStep, etherscanBaseUrl }) => {
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
      {acceptOfferStep == AcceptOfferStep.ApproveMarketplace && (
        <>
          <Text style="h6">Approve X2Y2 to access item in your wallet</Text>
          {/* <img style={{ height: 100 }} src={confirmingProgress} /> */}
          <Text style="subtitle2">
            We’ll ask your approval for the marketplace exchange to access your
            token. This is a one-time only operation per collection.
          </Text>
        </>
      )}
      {acceptOfferStep == AcceptOfferStep.Confirming && (
        <>
          <Text style="h6">Confirm transaction in your wallet</Text>
          <img style={{ height: 100 }} src={confirmingProgress} />
        </>
      )}

      {acceptOfferStep == AcceptOfferStep.Finalizing && (
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
          visibility:
            acceptOfferStep == AcceptOfferStep.Finalizing
              ? 'visible'
              : 'hidden',
        }}
        href={etherscanBaseUrl}
        target="_blank"
      >
        View on Etherscan
      </Anchor>
    </Flex>
  )
}
