import { useFallbackState, useReservoirClient, useTimeSince } from '../../hooks'
import React, { ReactElement, Dispatch, SetStateAction, useEffect } from 'react'
import { Flex, Text, Box, Button, Loader, Anchor } from '../../primitives'
import {
  EditListingModalRenderer,
  EditListingStep,
} from './EditListingModalRenderer'
import { Modal } from '../Modal'
import TokenPrimitive from '../TokenPrimitive'
import Progress from '../Progress'
import { useNetwork } from 'wagmi'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons'

type Props = Pick<Parameters<typeof Modal>['0'], 'trigger'> & {
  openState?: [boolean, Dispatch<SetStateAction<boolean>>]
  listingId?: string
  tokenId?: string
  collectionId?: string
  normalizeRoyalties?: boolean
  onClose?: (data: any, currentStep: EditListingStep) => void
  onCancelComplete?: (data: any) => void
  onCancelError?: (error: Error, data: any) => void
}

export function EditListingModal({
  openState,
  listingId,
  tokenId,
  collectionId,
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
  const reservoirChain = client?.currentChain()

  return (
    <EditListingModalRenderer
      listingId={listingId}
      tokenId={tokenId}
      collectionId={collectionId}
      open={open}
      normalizeRoyalties={normalizeRoyalties}
    >
      {({
        loading,
        listing,
        tokenId,
        contract,
        token,
        quantityAvailable,
        collection,
        quantity,
        setQuantity,
        editListingStep,
        transactionError,
        usdPrice,
        totalUsd,
        blockExplorerBaseUrl,
        steps,
        stepData,
        setEditListingStep,
        editListing,
      }) => {
        const expires = useTimeSince(listing?.expiration)
        const listingImg = tokenId
          ? `${reservoirChain?.baseApiUrl}/redirect/tokens/${contract}:${tokenId}/image/v1`
          : `${reservoirChain?.baseApiUrl}/redirect/collections/${contract}/image/v1`

        useEffect(() => {
          if (
            editListingStep === EditListingStep.Complete &&
            onCancelComplete
          ) {
            const data = {
              listing,
              stepData: stepData,
            }
            onCancelComplete(data)
          }
        }, [editListingStep])

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

        const orderZone = listing?.rawData?.zone
        const orderKind = listing?.kind

        return (
          <Modal
            trigger={trigger}
            title="Edit Listing"
            open={open}
            onOpenChange={(open) => {
              if (!open && onClose) {
                const data = {
                  listing,
                  stepData: stepData,
                }
                onClose(data, editListingStep)
              }
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
            {isListingAvailable && editListingStep === EditListingStep.Edit && (
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
                    priceSubtitle="Price"
                    usdPrice={totalUsd}
                    collection={listing.criteria?.data?.collection?.name || ''}
                    currencyContract={listing.price?.currency?.contract}
                    currencyDecimals={listing?.price?.currency?.decimals}
                    expires={expires}
                    source={(listing?.source?.icon as string) || ''}
                  />
                </Box>
                <Flex
                  css={{
                    gap: '$3',
                    p: '$4',
                  }}
                >
                  <Button
                    onClick={() => {
                      setOpen(false)
                    }}
                    color="secondary"
                    css={{ flex: 1 }}
                  >
                    Close
                  </Button>
                  <Button onClick={editListing} css={{ flex: 1 }}>
                    Confirm
                  </Button>
                </Flex>
              </Flex>
            )}
            {editListingStep === EditListingStep.Approving && (
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
                          : 'Confirm update to listing in your wallet'
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
            {editListingStep === EditListingStep.Complete && (
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
                    Listing Updated!
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
    </EditListingModalRenderer>
  )
}

EditListingModal.Custom = EditListingModalRenderer
