import { useFallbackState, useReservoirClient, useTimeSince } from '../../hooks'
import React, { ReactElement, Dispatch, SetStateAction, useEffect } from 'react'
import { Flex, Text, Box, Button, Loader, Anchor } from '../../primitives'
import { CancelBidModalRenderer, CancelStep } from './CancelBidModalRenderer'
import { Modal } from '../Modal'
import TokenPrimitive from '../../modal/TokenPrimitive'
import Progress from '../Progress'
import { useNetwork, useSwitchNetwork } from 'wagmi'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCircleExclamation,
  faGasPump,
} from '@fortawesome/free-solid-svg-icons'

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

  const { chains, chain: activeWalletChain } = useNetwork()
  const client = useReservoirClient()
  const { switchNetworkAsync } = useSwitchNetwork()

  const currentChain = client?.currentChain()

  const modalChain = chainId
    ? client?.chains.find(({ id }) => {
        id === chainId
      }) || currentChain
    : currentChain

  const wagmiChain = chains.find(({ id }) => {
    modalChain?.id === id
  })

  const handleCancel = async (cancelBid: () => void): Promise<void> => {
    if (modalChain?.id !== client?.currentChain()?.id) {
      const chain = await switchNetworkAsync?.()
      if (chain?.id !== activeWalletChain?.id) return
    }
    cancelBid()
  }

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
                {transactionError && (
                  <Flex
                    css={{
                      color: '$errorAccent',
                      p: '$4',
                      gap: '$2',
                      background: '$wellBackground',
                    }}
                    align="center"
                  >
                    <FontAwesomeIcon
                      icon={faCircleExclamation}
                      width={16}
                      height={16}
                    />
                    <Text style="body3" color="errorLight">
                      {transactionError.message}
                    </Text>
                  </Flex>
                )}
                <Box css={{ p: '$4', borderBottom: '1px solid $borderColor' }}>
                  <TokenPrimitive
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
                <Button
                  onClick={() => handleCancel(cancelOrder)}
                  css={{ m: '$4' }}
                >
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
                  {stepData?.currentStepItem.txHash
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

                  <Anchor
                    color="primary"
                    weight="medium"
                    css={{ fontSize: 12 }}
                    href={`${blockExplorerBaseUrl}/tx/${stepData?.currentStepItem.txHash}`}
                    target="_blank"
                  >
                    View on{' '}
                    {wagmiChain?.blockExplorers?.default.name || 'Etherscan'}
                  </Anchor>
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
