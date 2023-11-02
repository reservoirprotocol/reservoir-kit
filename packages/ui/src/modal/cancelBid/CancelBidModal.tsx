import { useFallbackState, useReservoirClient, useTimeSince } from '../../hooks'
import React, { ReactElement, Dispatch, SetStateAction, useEffect } from 'react'
import {
  Flex,
  Text,
  Box,
  Button,
  Loader,
  Anchor,
  ErrorWell,
} from '../../primitives'
import { CancelBidModalRenderer, CancelStep } from './CancelBidModalRenderer'
import { Modal } from '../Modal'
import TokenPrimitive from '../../modal/TokenPrimitive'
import Progress from '../Progress'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGasPump } from '@fortawesome/free-solid-svg-icons'
import { truncateAddress } from '../../lib/truncate'

const ModalCopy = {
  title: 'Cancel Offer',
  ctaCancel: 'Continue to Cancel',
  ctaAwaitingApproval: 'Waiting for approval...',
  ctaAwaitingValidation: 'Waiting for transaction to be validated',
  ctaClose: 'Close',
}

type Props = Pick<Parameters<typeof Modal>['0'], 'trigger'> & {
  openState?: [boolean, Dispatch<SetStateAction<boolean>>]
  bidId?: string
  chainId?: number
  normalizeRoyalties?: boolean
  copyOverrides?: Partial<typeof ModalCopy>
  onClose?: (data: any, currentStep: CancelStep) => void
  onCancelComplete?: (data: any) => void
  onCancelError?: (error: Error, data: any) => void
}

export function CancelBidModal({
  openState,
  bidId,
  chainId,
  trigger,
  normalizeRoyalties,
  copyOverrides,
  onClose,
  onCancelComplete,
  onCancelError,
}: Props): ReactElement {
  const copy: typeof ModalCopy = { ...ModalCopy, ...copyOverrides }
  const [open, setOpen] = useFallbackState(
    openState ? openState[0] : false,
    openState
  )

  const client = useReservoirClient()

  const currentChain = client?.currentChain()

  const modalChain = chainId
    ? client?.chains.find(({ id }) => id === chainId) || currentChain
    : currentChain

  return (
    <CancelBidModalRenderer
      chainId={modalChain?.id}
      bidId={bidId}
      open={open}
      normalizeRoyalties={normalizeRoyalties}
    >
      {({
        loading,
        bid,
        tokenId,
        cancelStep,
        transactionError,
        stepData,
        totalUsd,
        blockExplorerName,
        blockExplorerBaseUrl,
        cancelOrder,
      }) => {
        const expires = useTimeSince(bid?.expiration)
        const collectionId = bid?.criteria?.data?.collection?.id
        const bidImg = tokenId
          ? `${modalChain?.baseApiUrl}/redirect/tokens/${collectionId}:${tokenId}/image/v1?imageSize=small`
          : `${modalChain?.baseApiUrl}/redirect/collections/${collectionId}/image/v1`
        const isAttributeOffer = (bid?.criteria?.kind as any) === 'attribute'

        useEffect(() => {
          if (cancelStep === CancelStep.Complete && onCancelComplete) {
            const data = {
              bid,
              stepData: stepData,
            }
            onCancelComplete(data)
          }
        }, [cancelStep])

        useEffect(() => {
          if (transactionError && onCancelError) {
            const data = {
              bid,
              stepData: stepData,
            }
            onCancelError(transactionError, data)
          }
        }, [transactionError])

        const isBidAvailable =
          bid &&
          (bid.status === 'active' || bid.status === 'inactive') &&
          !loading

        const isOracleOrder = bid?.isNativeOffChainCancellable

        return (
          <Modal
            trigger={trigger}
            title={copy.title}
            open={open}
            onOpenChange={(open) => {
              if (!open && onClose) {
                const data = {
                  bid,
                  stepData: stepData,
                }
                onClose(data, cancelStep)
              }
              setOpen(open)
            }}
            loading={loading}
          >
            {!isBidAvailable && !loading && (
              <Flex
                direction="column"
                justify="center"
                css={{ px: '$4', py: '$6' }}
              >
                <Text style="h6" css={{ textAlign: 'center' }}>
                  Selected bid is no longer available
                </Text>
              </Flex>
            )}
            {isBidAvailable && cancelStep === CancelStep.Cancel && (
              <Flex direction="column">
                {transactionError && <ErrorWell error={transactionError} />}

                <Box css={{ p: '$4', borderBottom: '1px solid $borderColor' }}>
                  <TokenPrimitive
                    chain={modalChain}
                    img={bidImg}
                    name={bid?.criteria?.data?.token?.name}
                    price={bid?.price?.amount?.decimal}
                    usdPrice={totalUsd}
                    collection={bid?.criteria?.data?.collection?.name || ''}
                    currencyContract={bid?.price?.currency?.contract}
                    currencyDecimals={bid?.price?.currency?.decimals}
                    currencySymbol={bid?.price?.currency?.symbol}
                    expires={expires}
                    source={(bid?.source?.icon as string) || ''}
                    priceSubtitle="Offer"
                  />
                </Box>
                <Text
                  style="body2"
                  color="subtle"
                  css={{ mt: '$3', mr: '$3', ml: '$3', textAlign: 'center' }}
                >
                  {!isOracleOrder
                    ? 'This action will cancel your offer. You will be prompted to confirm this cancellation from your wallet. A gas fee is required.'
                    : 'This will cancel your offer for free. You will be prompted to confirm this cancellation from your wallet.'}
                </Text>
                <Button onClick={cancelOrder} css={{ m: '$4' }}>
                  {!isOracleOrder && (
                    <FontAwesomeIcon icon={faGasPump} width="16" height="16" />
                  )}
                  {copy.ctaCancel}
                </Button>
              </Flex>
            )}
            {cancelStep === CancelStep.Approving && (
              <Flex direction="column">
                <Box css={{ p: '$4', borderBottom: '1px solid $borderColor' }}>
                  <TokenPrimitive
                    chain={modalChain}
                    img={bidImg}
                    name={bid?.criteria?.data?.token?.name}
                    price={bid?.price?.amount?.decimal}
                    usdPrice={totalUsd}
                    collection={bid?.criteria?.data?.collection?.name || ''}
                    currencyContract={bid?.price?.currency?.contract}
                    currencyDecimals={bid?.price?.currency?.decimals}
                    currencySymbol={bid?.price?.currency?.symbol}
                    expires={expires}
                    source={(bid?.source?.icon as string) || ''}
                    priceSubtitle="Offer"
                  />
                </Box>
                {!stepData && <Loader css={{ height: 206 }} />}
                {stepData && (
                  <>
                    <Progress
                      title={
                        stepData?.currentStepItem.txHashes
                          ? 'Finalizing on blockchain'
                          : 'Confirm cancelation in your wallet'
                      }
                      txHashes={stepData?.currentStepItem.txHashes}
                      blockExplorerBaseUrl={blockExplorerBaseUrl}
                    />
                    {isAttributeOffer && !stepData?.currentStepItem.txHashes && (
                      <Flex justify="center">
                        <Text
                          style="body2"
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
                  {stepData?.currentStepItem.txHashes
                    ? copy.ctaAwaitingValidation
                    : copy.ctaAwaitingApproval}
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
                  <Text style="body2" color="subtle" css={{ mb: 24 }}>
                    <>
                      Your{' '}
                      <Text style="body2" color="accent">
                        {bid?.source?.name as string}
                      </Text>{' '}
                      offer for{' '}
                      <Text style="body2" color="accent">
                        {bid?.criteria?.data?.token?.name ||
                          bid?.criteria?.data?.collection?.name}{' '}
                      </Text>
                      at {bid?.price?.amount?.decimal}{' '}
                      {bid?.price?.currency?.symbol} has been canceled.
                    </>
                  </Text>

                  <Flex direction="column" align="center" css={{ gap: '$2' }}>
                    {stepData?.currentStepItem?.txHashes?.map(
                      (txHash, index) => {
                        const truncatedTxHash = truncateAddress(txHash)
                        return (
                          <Anchor
                            key={index}
                            href={`${blockExplorerBaseUrl}/tx/${txHash}`}
                            color="primary"
                            weight="medium"
                            target="_blank"
                            css={{ fontSize: 12 }}
                          >
                            View transaction: {truncatedTxHash}
                          </Anchor>
                        )
                      }
                    )}
                  </Flex>
                </Flex>
                <Button
                  onClick={() => {
                    setOpen(false)
                  }}
                  css={{ m: '$4' }}
                >
                  {copy.ctaClose}
                </Button>
              </Flex>
            )}
          </Modal>
        )
      }}
    </CancelBidModalRenderer>
  )
}

CancelBidModal.Custom = CancelBidModalRenderer
