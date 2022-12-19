import { useFallbackState, useReservoirClient, useTimeSince } from '../../hooks'
import React, { ReactElement, Dispatch, SetStateAction } from 'react'
import { Flex, Text, Box, Button, Loader, Anchor } from '../../primitives'
import { CancelBidModalRenderer, CancelStep } from './CancelBidModalRenderer'
import { Modal } from '../Modal'
import TokenPrimitive from '../../modal/TokenPrimitive'
import Progress from '../Progress'
import { useNetwork } from 'wagmi'

type Props = Pick<Parameters<typeof Modal>['0'], 'trigger'> & {
  openState?: [boolean, Dispatch<SetStateAction<boolean>>]
  bidId?: string
  normalizeRoyalties?: boolean
  onClose?: () => void
  onCancelComplete?: (data: any) => void
  onCancelError?: (error: Error, data: any) => void
}

export function CancelBidModal({
  openState,
  bidId,
  trigger,
  normalizeRoyalties,
  onClose,
  onCancelComplete,
  onCancelError,
}: Props): ReactElement {
  const [open, setOpen] = useFallbackState(
    openState ? openState[0] : false,
    openState
  )
  const client = useReservoirClient()
  const { chain: activeChain } = useNetwork()

  return (
    <CancelBidModalRenderer
      bidId={bidId}
      open={open}
      normalizeRoyalties={normalizeRoyalties}
    >
      {({
        bid,
        tokenId,
        cancelStep,
        transactionError,
        stepData,
        totalUsd,
        blockExplorerBaseUrl,
        setCancelStep,
        cancelOrder,
      }) => {
        const expires = useTimeSince(bid?.expiration)
        const collectionId = bid?.metadata?.data?.collectionId
        const bidImg = tokenId
          ? `${client?.apiBase}/redirect/tokens/${collectionId}:${tokenId}/image/v1`
          : `${client?.apiBase}/redirect/collections/${collectionId}/image/v1`
        const isAttributeOffer = (bid?.metadata?.kind as any) === 'attribute'
        const successMessage = `Your ${bid?.source?.name} offer for ${
          bid?.metadata?.data?.tokenName || bid?.metadata?.data?.collectionName
        } at ${bid?.price?.amount?.decimal} ${
          bid?.price?.currency?.symbol
        } has been canceled.`
        return (
          <Modal
            trigger={trigger}
            title="Cancel Offer"
            open={open}
            onOpenChange={(open) => {
              setOpen(open)
            }}
            loading={!bid}
          >
            {bid && cancelStep === CancelStep.Cancel && (
              <Flex direction="column">
                <Box css={{ p: '$4', borderBottom: '1px solid $borderColor' }}>
                  <TokenPrimitive
                    img={bidImg}
                    name={bid?.metadata?.data?.tokenName}
                    price={bid?.price?.amount?.decimal}
                    usdPrice={totalUsd}
                    collection={bid?.metadata?.data?.collectionName || ''}
                    currencyContract={bid?.price?.currency?.contract}
                    currencyDecimals={bid?.price?.currency?.decimals}
                    expires={expires}
                    source={(bid?.source?.icon as string) || ''}
                    isOffer={true}
                  />
                </Box>
                <Text
                  style="body3"
                  color="subtle"
                  css={{ mt: '$3', mr: '$3', ml: '$3', textAlign: 'center' }}
                >
                  This will cancel your offer. You will be asked to confirm this
                  cancelation from your wallet.
                </Text>
                <Button onClick={cancelOrder} css={{ m: '$4' }}>
                  Continue to Cancel
                </Button>
              </Flex>
            )}
            {cancelStep === CancelStep.Approving && (
              <Flex direction="column">
                <Box css={{ p: '$4', borderBottom: '1px solid $borderColor' }}>
                  <TokenPrimitive
                    img={bidImg}
                    name={bid?.metadata?.data?.tokenName}
                    price={bid?.price?.amount?.decimal}
                    usdPrice={totalUsd}
                    collection={bid?.metadata?.data?.collectionName || ''}
                    currencyContract={bid?.price?.currency?.contract}
                    currencyDecimals={bid?.price?.currency?.decimals}
                    expires={expires}
                    source={(bid?.source?.icon as string) || ''}
                    isOffer={true}
                  />
                </Box>
                {!stepData && <Loader css={{ height: 206 }} />}
                {stepData && (
                  <>
                    <Progress
                      title={
                        stepData?.currentStepItem.txHash
                          ? 'Finalizing on blockchain'
                          : 'Confirm cancelation in your wallet'
                      }
                      txHash={stepData?.currentStepItem.txHash}
                      blockExplorerBaseUrl={`${blockExplorerBaseUrl}/tx/${stepData?.currentStepItem.txHash}`}
                    />
                    {isAttributeOffer && !stepData?.currentStepItem.txHash && (
                      <Flex justify="center">
                        <Text
                          style="body3"
                          color="subtle"
                          css={{ maxWidth: 400, textAlign: 'center', mx: '$3' }}
                        >
                          This will cancel your offer on all items that were
                          included in this attribute offer.
                        </Text>
                      </Flex>
                    )}
                  </>
                )}
                <Button disabled={true} css={{ m: '$4' }}>
                  <Loader />
                  {stepData?.currentStepItem.txHash
                    ? 'Waiting for transaction to be validated'
                    : 'Waiting for approval...'}
                </Button>
              </Flex>
            )}
            {cancelStep === CancelStep.Complete && (
              <Flex direction="column">
                <Flex
                  css={{
                    p: '$4',
                    py: '$5',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                  }}
                >
                  <Text style="h5" css={{ mb: '$2' }}>
                    Offer Canceled!
                  </Text>
                  <Text style="body3" css={{ mb: 24 }}>
                    {successMessage}
                  </Text>

                  <Anchor
                    color="primary"
                    weight="medium"
                    css={{ fontSize: 12 }}
                    href={`${blockExplorerBaseUrl}/tx/${stepData?.currentStepItem.txHash}`}
                    target="_blank"
                  >
                    View on{' '}
                    {activeChain?.blockExplorers?.default.name || 'Etherscan'}
                  </Anchor>
                </Flex>
              </Flex>
            )}
          </Modal>
        )
      }}
    </CancelBidModalRenderer>
  )
}

CancelBidModal.Custom = CancelBidModalRenderer
