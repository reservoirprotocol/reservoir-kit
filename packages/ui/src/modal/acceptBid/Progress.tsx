import { Anchor, Box, Flex, Text } from '../../primitives'
import React, { FC } from 'react'
import { AcceptBidStep, StepData } from './AcceptBidModalRenderer'

import TransactionProgress from '../TransactionProgress'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCube, faWallet } from '@fortawesome/free-solid-svg-icons'
import { useNetwork } from 'wagmi'

type Props = {
  acceptBidStep: AcceptBidStep
  etherscanBaseUrl?: string
  marketplace: {
    name: string
    image: string
  }
  tokenImage?: string
  stepData: StepData | null
}

export const Progress: FC<Props> = ({
  acceptBidStep,
  etherscanBaseUrl,
  marketplace,
  tokenImage,
  stepData,
}) => {
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
      {acceptBidStep == AcceptBidStep.ApproveMarketplace && (
        <>
          <Text style="h6" css={{ mb: 28 }}>
            {stepData && stepData.totalSteps > 2
              ? stepData.currentStep.action
              : `Approve ${marketplace?.name} to access item in your wallet`}
          </Text>
          <Flex
            css={{
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 22,
              mb: 24,
            }}
          >
            <TransactionProgress
              fromImg={tokenImage || ''}
              toImg={marketplace?.image}
            />
          </Flex>
          <Text style="subtitle2" css={{ mx: 56, textAlign: 'center' }}>
            {stepData && stepData.totalSteps > 2
              ? stepData.currentStep.description
              : `We’ll ask your approval for the ${marketplace?.name} exchange to
            access your token. This is a one-time only operation per collection.`}
          </Text>
        </>
      )}
      {acceptBidStep == AcceptBidStep.Confirming && (
        <>
          <Text style="h6">Confirm transaction in your wallet</Text>
          <Box css={{ color: '$neutralText' }}>
            <FontAwesomeIcon
              icon={faWallet}
              style={{
                width: '32px',
                height: '32px',
                margin: '12px 0px',
              }}
            />
          </Box>
        </>
      )}

      {acceptBidStep == AcceptBidStep.Finalizing && (
        <>
          <Text style="h6">Finalizing on blockchain</Text>
          <Box css={{ color: '$neutralText' }}>
            <FontAwesomeIcon
              icon={faCube}
              style={{
                width: '32px',
                height: '32px',
                margin: '12px 0px',
              }}
            />
          </Box>
          <Anchor
            color="primary"
            weight="medium"
            css={{
              fontSize: 12,
            }}
            href={etherscanBaseUrl}
            target="_blank"
          >
            View on {activeChain?.blockExplorers?.default.name || 'Etherscan'}
          </Anchor>
        </>
      )}
    </Flex>
  )
}
