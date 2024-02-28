import { useFallbackState, useReservoirClient, useTimeSince } from '../../hooks'
import React, {
  ReactElement,
  Dispatch,
  SetStateAction,
  useEffect,
  ComponentPropsWithoutRef,
} from 'react'
import {
  Flex,
  Text,
  Box,
  Button,
  Loader,
  Anchor,
  ErrorWell,
} from '../../primitives'
import {
  CancelListingModalRenderer,
  CancelStep,
} from './CancelListingModalRenderer'
import { Modal } from '../Modal'
import TokenPrimitive from '../TokenPrimitive'
import Progress from '../Progress'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import faGasPump from '@fortawesome/free-solid-svg-icons/faGasPump'

import { truncateAddress } from '../../lib/truncate'
import { WalletClient } from 'viem'
import { ReservoirWallet } from '@reservoir0x/reservoir-sdk'
import getChainBlockExplorerUrl from '../../lib/getChainBlockExplorerUrl'
import { Dialog } from '../../primitives/Dialog'

const ModalCopy = {
  title: 'Cancel Listing',
  ctaCancel: 'Continue to Cancel',
  ctaAwaitingApproval: 'Waiting for approval...',
  ctaAwaitingValidation: 'Waiting for transaction to be validated',
  ctaClose: 'Close',
}

type Props = Pick<Parameters<typeof Modal>['0'], 'trigger'> & {
  openState?: [boolean, Dispatch<SetStateAction<boolean>>]
  listingId?: string
  chainId?: number
  normalizeRoyalties?: boolean
  copyOverrides?: Partial<typeof ModalCopy>
  walletClient?: ReservoirWallet | WalletClient
  onClose?: (data: any, currentStep: CancelStep) => void
  onCancelComplete?: (data: any) => void
  onCancelError?: (error: Error, data: any) => void
  onPointerDownOutside?: ComponentPropsWithoutRef<
    typeof Dialog
  >['onPointerDownOutside']
}

export function CancelListingModal({
  openState,
  listingId,
  chainId,
  trigger,
  normalizeRoyalties,
  copyOverrides,
  walletClient,
  onClose,
  onCancelComplete,
  onCancelError,
  onPointerDownOutside,
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
    <CancelListingModalRenderer
      chainId={modalChain?.id}
      listingId={listingId}
      open={open}
      normalizeRoyalties={normalizeRoyalties}
      walletClient={walletClient}
    >
      {({
        loading,
        listing,
        tokenId,
        contract,
        cancelStep,
        transactionError,
        stepData,
        totalUsd,
        blockExplorerName,
        cancelOrder,
      }) => {
        const expires = useTimeSince(listing?.expiration)
        const listingImg = tokenId
          ? `${modalChain?.baseApiUrl}/redirect/tokens/${contract}:${tokenId}/image/v1?imageSize=small`
          : `${modalChain?.baseApiUrl}/redirect/collections/${contract}/image/v1`

        useEffect(() => {
          if (cancelStep === CancelStep.Complete && onCancelComplete) {
            const data = {
              listing,
              stepData: stepData,
            }
            onCancelComplete(data)
          }
        }, [cancelStep])

        useEffect(() => {
          if (transactionError && onCancelError) {
            const data = {
              listing,
              stepData: stepData,
            }
            onCancelError(transactionError, data)
          }
        }, [transactionError])

        const isListingAvailable =
          listing &&
          (listing.status === 'active' || listing.status === 'inactive') &&
          !loading

        const isOracleOrder = listing?.isNativeOffChainCancellable

        return (
          <Modal
            trigger={trigger}
            title={copy.title}
            open={open}
            onOpenChange={(open) => {
              if (!open && onClose) {
                const data = {
                  listing,
                  stepData: stepData,
                }
                onClose(data, cancelStep)
              }
              setOpen(open)
            }}
            loading={loading}
            onPointerDownOutside={(e) => {
              if (onPointerDownOutside) {
                onPointerDownOutside(e)
              }
            }}
          >
            {!isListingAvailable && !loading && (
              <Flex
                direction="column"
                justify="center"
                css={{ px: '$4', py: '$6' }}
              >
                <Text style="h6" css={{ textAlign: 'center' }}>
                  Selected listing is no longer available
                </Text>
              </Flex>
            )}
            {isListingAvailable && cancelStep === CancelStep.Cancel && (
              <Flex direction="column">
                {transactionError && <ErrorWell error={transactionError} />}
                <Box css={{ p: '$4', borderBottom: '1px solid $borderColor' }}>
                  <TokenPrimitive
                    chain={modalChain}
                    img={listingImg}
                    name={listing.criteria?.data?.token?.name}
                    price={listing?.price?.amount?.decimal}
                    usdPrice={totalUsd}
                    collection={listing.criteria?.data?.collection?.name || ''}
                    currencyContract={listing.price?.currency?.contract}
                    currencyDecimals={listing?.price?.currency?.decimals}
                    currencySymbol={listing?.price?.currency?.symbol}
                    expires={expires}
                    source={(listing?.source?.icon as string) || ''}
                  />
                </Box>
                <Text
                  style="body2"
                  color="subtle"
                  css={{ mt: '$3', mr: '$3', ml: '$3', textAlign: 'center' }}
                >
                  {!isOracleOrder
                    ? 'This action will cancel your listing. You will be prompted to confirm this cancellation from your wallet. A gas fee is required.'
                    : 'This will cancel your listing for free. You will be prompted to confirm this cancellation from your wallet.'}
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
                    img={listingImg}
                    name={listing?.criteria?.data?.token?.name}
                    price={listing?.price?.amount?.decimal}
                    usdPrice={totalUsd}
                    collection={listing?.criteria?.data?.collection?.name || ''}
                    currencyContract={listing?.price?.currency?.contract}
                    currencyDecimals={listing?.price?.currency?.decimals}
                    currencySymbol={listing?.price?.currency?.symbol}
                    expires={expires}
                    source={(listing?.source?.icon as string) || ''}
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
                      txHashes={stepData?.currentStepItem?.txHashes}
                    />
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
                    Listing Canceled!
                  </Text>
                  <Text style="body2" color="subtle" css={{ mb: 24 }}>
                    <>
                      Your{' '}
                      <Text style="body2" color="accent">
                        {listing?.source?.name as string}
                      </Text>{' '}
                      listing for{' '}
                      <Text style="body2" color="accent">
                        {listing?.criteria?.data?.token?.name ||
                          listing?.criteria?.data?.collection?.name}{' '}
                      </Text>
                      at {listing?.price?.amount?.decimal}{' '}
                      {listing?.price?.currency?.symbol} has been canceled.
                    </>
                  </Text>
                  <Flex direction="column" align="center" css={{ gap: '$2' }}>
                    {stepData?.currentStepItem?.txHashes?.map((hash, index) => {
                      const truncatedTxHash = truncateAddress(hash.txHash)
                      const blockExplorerBaseUrl = getChainBlockExplorerUrl(
                        hash.chainId
                      )
                      return (
                        <Anchor
                          key={index}
                          href={`${blockExplorerBaseUrl}/tx/${hash.txHash}`}
                          color="primary"
                          weight="medium"
                          target="_blank"
                          css={{ fontSize: 12 }}
                        >
                          View transaction: {truncatedTxHash}
                        </Anchor>
                      )
                    })}
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
    </CancelListingModalRenderer>
  )
}

CancelListingModal.Custom = CancelListingModalRenderer
