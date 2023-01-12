import { useFallbackState, useReservoirClient, useTimeSince } from '../../hooks'
import React, { ReactElement, Dispatch, SetStateAction, useEffect } from 'react'
import { Flex, Text, Box, Button, Loader, Anchor } from '../../primitives'
import {
  CancelListingModalRenderer,
  CancelStep,
} from './CancelListingModalRenderer'
import { Modal } from '../Modal'
import TokenPrimitive from '../TokenPrimitive'
import Progress from '../Progress'
import { useNetwork } from 'wagmi'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons'

type Props = Pick<Parameters<typeof Modal>['0'], 'trigger'> & {
  openState?: [boolean, Dispatch<SetStateAction<boolean>>]
  listingId?: string
  normalizeRoyalties?: boolean
  onClose?: () => void
  onCancelComplete?: (data: any) => void
  onCancelError?: (error: Error, data: any) => void
}

export function CancelListingModal({
  openState,
  listingId,
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
    <CancelListingModalRenderer
      listingId={listingId}
      open={open}
      normalizeRoyalties={normalizeRoyalties}
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
        blockExplorerBaseUrl,
        cancelOrder,
      }) => {
        const expires = useTimeSince(listing?.expiration)
        const listingImg = tokenId
          ? `${client?.apiBase}/redirect/tokens/${contract}:${tokenId}/image/v1`
          : `${client?.apiBase}/redirect/collections/${contract}/image/v1`

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

        return (
          <Modal
            trigger={trigger}
            title="Cancel Listing"
            open={open}
            onOpenChange={(open) => {
              setOpen(open)
            }}
            loading={loading}
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
                    <Text style="body2" color="errorLight">
                      {transactionError.message}
                    </Text>
                  </Flex>
                )}
                <Box css={{ p: '$4', borderBottom: '1px solid $borderColor' }}>
                  <TokenPrimitive
                    img={listingImg}
                    name={listing.criteria?.data?.token?.name}
                    price={listing?.price?.amount?.decimal}
                    usdPrice={totalUsd}
                    collection={listing.criteria?.data?.collection?.name || ''}
                    currencyContract={listing.price?.currency?.contract}
                    currencyDecimals={listing?.price?.currency?.decimals}
                    expires={expires}
                    source={(listing?.source?.icon as string) || ''}
                  />
                </Box>
                <Text
                  style="body3"
                  color="subtle"
                  css={{ mt: '$3', mr: '$3', ml: '$3', textAlign: 'center' }}
                >
                  This will cancel your listing. You will be asked to confirm
                  this cancelation from your wallet.
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
                    img={listingImg}
                    name={listing?.criteria?.data?.token?.name}
                    price={listing?.price?.amount?.decimal}
                    usdPrice={totalUsd}
                    collection={listing?.criteria?.data?.collection?.name || ''}
                    currencyContract={listing?.price?.currency?.contract}
                    currencyDecimals={listing?.price?.currency?.decimals}
                    expires={expires}
                    source={(listing?.source?.icon as string) || ''}
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
                    Listing Canceled!
                  </Text>
                  <Text style="body3" color="subtle" css={{ mb: 24 }}>
                    <>
                      Your{' '}
                      <Text style="body3" color="accent">
                        {listing?.source?.name as string}
                      </Text>{' '}
                      listing for{' '}
                      <Text style="body3" color="accent">
                        {listing?.criteria?.data?.token?.name ||
                          listing?.criteria?.data?.collection?.name}{' '}
                      </Text>
                      at {listing?.price?.amount?.decimal}{' '}
                      {listing?.price?.currency?.symbol} has been canceled.
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
                    {activeChain?.blockExplorers?.default.name || 'Etherscan'}
                  </Anchor>
                </Flex>
                <Button
                  onClick={() => {
                    setOpen(false)
                    if (onClose) {
                      onClose()
                    }
                  }}
                  css={{ m: '$4' }}
                >
                  Close
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
