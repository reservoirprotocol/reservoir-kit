import React, { Dispatch, ReactElement, SetStateAction, useEffect } from 'react'

import {
  Flex,
  Box,
  Text,
  Anchor,
  Button,
  FormatCurrency,
  Loader,
  FormatCryptoCurrency,
} from '../../primitives'

import { Progress } from './Progress'
import { Modal } from '../Modal'
import {
  faCircleExclamation,
  faCheckCircle,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import TokenLineItem from '../TokenLineItem'
import {
  AcceptBidStep,
  AcceptBidModalRenderer,
  StepData,
} from './AcceptBidModalRenderer'
import Fees from './Fees'
import { useFallbackState, useReservoirClient, useTimeSince } from '../../hooks'
import { useNetwork } from 'wagmi'

type BidData = {
  tokenId?: string
  collectionId?: string
  txHash?: string
  maker?: string
}

type Props = Pick<Parameters<typeof Modal>['0'], 'trigger'> & {
  openState?: [boolean, Dispatch<SetStateAction<boolean>>]
  tokenId?: string
  collectionId?: string
  bidId?: string
  normalizeRoyalties?: boolean
  onBidAccepted?: (data: BidData) => void
  onClose?: () => void
  onBidAcceptError?: (error: Error, data: BidData) => void
  onCurrentStepUpdate?: (data: StepData) => void
}

function titleForStep(step: AcceptBidStep) {
  switch (step) {
    case AcceptBidStep.Unavailable:
      return 'Selected item is no longer available'
    default:
      return 'Accept Offer'
  }
}

export function AcceptBidModal({
  openState,
  trigger,
  tokenId,
  collectionId,
  bidId,
  normalizeRoyalties,
  onBidAccepted,
  onClose,
  onBidAcceptError,
  onCurrentStepUpdate,
}: Props): ReactElement {
  const [open, setOpen] = useFallbackState(
    openState ? openState[0] : false,
    openState
  )
  const client = useReservoirClient()
  const { chain: activeChain } = useNetwork()

  return (
    <AcceptBidModalRenderer
      open={open}
      tokenId={tokenId}
      collectionId={collectionId}
      bidId={bidId}
      normalizeRoyalties={normalizeRoyalties}
    >
      {({
        loading,
        token,
        collection,
        source,
        expiration,
        totalPrice,
        bidAmount,
        bidAmountCurrency,
        ethBidAmount,
        fees,
        acceptBidStep,
        transactionError,
        txHash,
        totalUsd,
        usdPrice,
        address,
        etherscanBaseUrl,
        stepData,
        acceptBid,
      }) => {
        const title = titleForStep(acceptBidStep)

        useEffect(() => {
          if (acceptBidStep === AcceptBidStep.Complete && onBidAccepted) {
            const data: BidData = {
              tokenId: tokenId,
              collectionId: collectionId,
              maker: address,
            }
            if (txHash) {
              data.txHash = txHash
            }
            onBidAccepted(data)
          }
        }, [acceptBidStep])

        useEffect(() => {
          if (transactionError && onBidAcceptError) {
            const data: BidData = {
              tokenId: tokenId,
              collectionId: collectionId,
              maker: address,
            }
            onBidAcceptError(transactionError, data)
          }
        }, [transactionError])

        useEffect(() => {
          if (stepData && onCurrentStepUpdate) {
            onCurrentStepUpdate(stepData)
          }
        }, [stepData])

        const floorPrice = token?.market?.floorAsk?.price?.amount?.native

        const difference =
          floorPrice && ethBidAmount
            ? ((floorPrice - ethBidAmount) / floorPrice) * 100
            : undefined

        const warning =
          difference && difference > 50
            ? `${difference}% lower than floor price`
            : undefined

        const marketplace = {
          name: (source?.name as string) || 'Marketplace',
          image: (source?.icon as string) || '',
        }

        const tokenImage =
          token?.token?.image || token?.token?.collection?.image

        const expires = useTimeSince(expiration)

        return (
          <Modal
            trigger={trigger}
            title={title}
            open={open}
            onOpenChange={(open) => setOpen(open)}
            loading={loading}
          >
            {acceptBidStep === AcceptBidStep.Unavailable && !loading && (
              <Flex direction="column">
                <TokenLineItem
                  tokenDetails={token}
                  collection={collection}
                  usdConversion={usdPrice || 0}
                  isUnavailable={true}
                  price={bidAmount}
                  warning={warning}
                  currency={bidAmountCurrency}
                  expires={expires}
                  isOffer={true}
                  sourceImg={source?.icon ? (source.icon as string) : undefined}
                />
                <Button onClick={() => setOpen(false)} css={{ m: '$4' }}>
                  Close
                </Button>
              </Flex>
            )}

            {acceptBidStep === AcceptBidStep.Checkout && !loading && (
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
                <TokenLineItem
                  tokenDetails={token}
                  collection={collection}
                  usdConversion={usdPrice || 0}
                  price={bidAmount}
                  warning={warning}
                  currency={bidAmountCurrency}
                  expires={expires}
                  isOffer={true}
                  sourceImg={source?.icon ? (source.icon as string) : undefined}
                />
                <Fees fees={fees} marketplace={marketplace.name} />

                <Flex
                  align="center"
                  justify="between"
                  css={{ px: '$4', mt: '$4' }}
                >
                  <Text style="h6">You Get</Text>
                  <FormatCryptoCurrency
                    textStyle="h6"
                    amount={totalPrice}
                    address={bidAmountCurrency?.contract}
                    logoWidth={16}
                  />
                </Flex>
                <Flex justify="end">
                  <FormatCurrency
                    amount={totalUsd}
                    color="subtle"
                    css={{ mr: '$4' }}
                  />
                </Flex>

                <Button
                  style={{
                    flex: 1,
                    marginBottom: 16,
                    marginTop: 16,
                    marginRight: 16,
                    marginLeft: 16,
                  }}
                  color="primary"
                  onClick={acceptBid}
                >
                  Accept
                </Button>
              </Flex>
            )}

            {(acceptBidStep === AcceptBidStep.Confirming ||
              acceptBidStep === AcceptBidStep.Finalizing ||
              acceptBidStep === AcceptBidStep.ApproveMarketplace) &&
              token && (
                <Flex direction="column">
                  <TokenLineItem
                    tokenDetails={token}
                    collection={collection}
                    usdConversion={usdPrice || 0}
                    price={bidAmount}
                    warning={warning}
                    currency={bidAmountCurrency}
                    expires={expires}
                    isOffer={true}
                    sourceImg={
                      source?.icon ? (source.icon as string) : undefined
                    }
                  />
                  <Progress
                    acceptBidStep={acceptBidStep}
                    etherscanBaseUrl={`${etherscanBaseUrl}/tx/${txHash}`}
                    marketplace={marketplace}
                    tokenImage={tokenImage}
                    stepData={stepData}
                  />
                  <Button disabled={true} css={{ m: '$4' }}>
                    <Loader />
                    {acceptBidStep === AcceptBidStep.Confirming
                      ? 'Waiting for approval...'
                      : 'Waiting for transaction to be validated'}
                  </Button>
                </Flex>
              )}

            {acceptBidStep === AcceptBidStep.Complete && token && (
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
                  {' '}
                  <Box
                    css={{
                      color: '$successAccent',
                      mb: 24,
                    }}
                  >
                    <FontAwesomeIcon icon={faCheckCircle} fontSize={32} />
                  </Box>
                  <Text style="h5" css={{ mb: 8 }}>
                    Bid accepted!
                  </Text>
                  <Flex
                    css={{ mb: 24, maxWidth: '100%' }}
                    align="center"
                    justify="center"
                  >
                    <Text
                      style="subtitle2"
                      css={{ maxWidth: '100%' }}
                      ellipsify
                    >
                      You’ve sold{' '}
                      <Anchor
                        color="primary"
                        weight="medium"
                        css={{ fontSize: 12 }}
                        href={`${client?.apiBase}/redirect/sources/${client?.source}/tokens/${token.token?.contract}:${token?.token?.tokenId}/link/v2`}
                        target="_blank"
                      >
                        {token?.token?.name
                          ? token?.token?.name
                          : `#${token?.token?.tokenId}`}
                      </Anchor>{' '}
                      from the {token?.token?.collection?.name} collection.
                    </Text>
                  </Flex>
                  <Anchor
                    color="primary"
                    weight="medium"
                    css={{ fontSize: 12 }}
                    href={`${etherscanBaseUrl}/tx/${txHash}`}
                    target="_blank"
                  >
                    View on{' '}
                    {activeChain?.blockExplorers?.default.name || 'Etherscan'}
                  </Anchor>
                </Flex>
                <Flex
                  css={{
                    p: '$4',
                    flexDirection: 'column',
                    gap: '$3',
                    '@bp1': {
                      flexDirection: 'row',
                    },
                  }}
                >
                  <Button
                    css={{ width: '100%' }}
                    onClick={() => {
                      setOpen(false)
                      if (onClose) onClose()
                    }}
                  >
                    Done
                  </Button>
                </Flex>
              </Flex>
            )}
          </Modal>
        )
      }}
    </AcceptBidModalRenderer>
  )
}

AcceptBidModal.Custom = AcceptBidModalRenderer
