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
  faChevronDown,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  AcceptBidStep,
  AcceptBidModalRenderer,
  AcceptBidStepData,
  AcceptBidTokenData,
  EnhancedAcceptBidTokenData,
} from './AcceptBidModalRenderer'
import { useBids, useFallbackState, useReservoirClient } from '../../hooks'
import { useNetwork } from 'wagmi'
import AcceptBidLineItem from './AcceptBidLineItem'
import { Collapsible } from '../../primitives/Collapsible'

type BidData = {
  tokens?: EnhancedAcceptBidTokenData[]
  bids?: NonNullable<ReturnType<typeof useBids>['data']>
  txHash?: string
  maker?: string
}

type Props = Pick<Parameters<typeof Modal>['0'], 'trigger'> & {
  openState?: [boolean, Dispatch<SetStateAction<boolean>>]
  tokens: AcceptBidTokenData[]
  normalizeRoyalties?: boolean
  onBidAccepted?: (data: BidData) => void
  onClose?: (
    data: BidData,
    stepData: AcceptBidStepData | null,
    currentStep: AcceptBidStep
  ) => void
  onBidAcceptError?: (error: Error, data: BidData) => void
  onCurrentStepUpdate?: (data: AcceptBidStepData) => void
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
  tokens,
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
  const reservoirChain = client?.currentChain()

  return (
    <AcceptBidModalRenderer
      open={open}
      tokens={tokens}
      normalizeRoyalties={normalizeRoyalties}
    >
      {({
        loading,
        acceptBidStep,
        transactionError,
        txHash,
        bids,
        usdPrices,
        prices,
        tokensData,
        address,
        blockExplorerBaseUrl,
        stepData,
        acceptBid,
      }) => {
        const title = titleForStep(acceptBidStep)

        useEffect(() => {
          if (acceptBidStep === AcceptBidStep.Complete && onBidAccepted) {
            const data: BidData = {
              tokens: tokensData,
              bids,
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
              tokens: tokensData,
              bids,
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

        return (
          <Modal
            trigger={trigger}
            title={title}
            open={open}
            onOpenChange={(open) => {
              if (!open && onClose) {
                const data: BidData = {
                  tokens: tokensData,
                  bids,
                  maker: address,
                }
                onClose(data, stepData, acceptBidStep)
              }
              setOpen(open)
            }}
            loading={loading}
          >
            {acceptBidStep === AcceptBidStep.Unavailable && !loading && (
              <Flex direction="column">
                {/* //TODO */}
                {bids.map(({ tokenData, price, source }) => (
                  <AcceptBidLineItem
                    token={{
                      name: tokenData?.token?.name || '',
                      id: tokenData?.token?.tokenId || '',
                    }}
                    collection={{
                      id: tokenData?.token?.collection?.id || '',
                      name: tokenData?.token?.collection?.name || '',
                    }}
                    img={
                      tokenData?.token?.image ||
                      tokenData?.token?.collection?.image ||
                      ''
                    }
                    price={price?.netAmount?.decimal}
                    currency={price?.currency?.contract}
                    decimals={price?.currency?.decimals}
                    sourceImg={
                      source?.icon ? (source.icon as string) : undefined
                    }
                  />
                ))}

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
                    <Text style="body3" color="errorLight">
                      {transactionError.message}
                    </Text>
                  </Flex>
                )}
                <Flex justify="between" css={{ px: '$4', pt: '$4' }}>
                  <Text style="subtitle2" color="subtle">
                    {bids.length > 1 ? `${bids.length} Items` : 'Item'}
                  </Text>
                  <Text style="subtitle2" color="subtle">
                    Total Offer Value
                  </Text>
                </Flex>
                {bids.map(({ tokenData, price, source, feeBreakdown }) => (
                  <AcceptBidLineItem
                    token={{
                      name: tokenData?.token?.name || '',
                      id: tokenData?.token?.tokenId || '',
                    }}
                    collection={{
                      id: tokenData?.token?.collection?.id || '',
                      name: tokenData?.token?.collection?.name || '',
                    }}
                    img={
                      tokenData?.token?.image ||
                      tokenData?.token?.collection?.image ||
                      ''
                    }
                    price={price?.netAmount?.decimal}
                    nativePrice={price?.netAmount?.native}
                    nativeFloorPrice={
                      tokenData?.market?.floorAsk?.price?.netAmount?.native
                    }
                    currency={price?.currency?.contract}
                    decimals={price?.currency?.decimals}
                    sourceImg={
                      source?.icon ? (source.icon as string) : undefined
                    }
                    royaltiesBps={feeBreakdown?.reduce((total, fee) => {
                      if (fee?.kind === 'royalty') {
                        total += fee?.bps || 0
                      }
                      return total
                    }, 0)}
                  />
                ))}

                {prices.map((price) => (
                  <Collapsible
                    trigger={
                      <Flex justify="between" css={{ p: '$4' }}>
                        <Text style="h6">
                          {price.currency?.symbol} You Get{' '}
                          <Text css={{ color: '$neutralSolidHover', ml: '$2' }}>
                            <FontAwesomeIcon
                              icon={faChevronDown}
                              width={16}
                              height={16}
                            />
                          </Text>
                        </Text>
                        <Flex direction="column" css={{ gap: '$1' }}>
                          <FormatCryptoCurrency
                            amount={price.netAmount}
                            decimals={price.currency?.decimals}
                            address={price.currency?.contract}
                            symbol={price.currency?.symbol}
                            textStyle="h6"
                          />
                          {price.currency?.symbol &&
                          usdPrices[price.currency.symbol] ? (
                            <FormatCurrency
                              color="subtle"
                              style="tiny"
                              amount={
                                usdPrices[price.currency.symbol].price *
                                price.amount
                              }
                              css={{ textAlign: 'end' }}
                            />
                          ) : null}
                        </Flex>
                      </Flex>
                    }
                  >
                    <Flex
                      css={{
                        gap: '$2',
                        padding: '$4',
                        paddingTop: 0,
                      }}
                      direction="column"
                    >
                      <Flex justify="between">
                        <Text style="subtitle2" color="subtle">
                          Total {price.currency?.symbol} Offer Value
                        </Text>
                        <FormatCryptoCurrency
                          amount={price.amount}
                          decimals={price.currency?.decimals}
                          address={price.currency?.contract}
                          symbol={price.currency?.symbol}
                          textStyle="subtitle2"
                        />
                      </Flex>
                      {price.royalty > 0 ? (
                        <Flex justify="between">
                          <Text style="subtitle2" color="subtle">
                            Creator Royalties
                          </Text>
                          <FormatCryptoCurrency
                            amount={price.royalty * -1}
                            decimals={price.currency?.decimals}
                            address={price.currency?.contract}
                            symbol={price.currency?.symbol}
                            textStyle="subtitle2"
                          />
                        </Flex>
                      ) : null}
                      {price.marketplaceFee > 0 ? (
                        <Flex justify="between">
                          <Text style="subtitle2" color="subtle">
                            Marketplace Fee
                          </Text>
                          <FormatCryptoCurrency
                            amount={price.marketplaceFee * -1}
                            decimals={price.currency?.decimals}
                            address={price.currency?.contract}
                            symbol={price.currency?.symbol}
                            textStyle="subtitle2"
                          />
                        </Flex>
                      ) : null}
                    </Flex>
                  </Collapsible>
                ))}

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

            {/* {(acceptBidStep === AcceptBidStep.Confirming ||
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
                    priceSubtitle="Offer"
                    sourceImg={
                      source?.icon ? (source.icon as string) : undefined
                    }
                  />
                  <Progress
                    acceptBidStep={acceptBidStep}
                    etherscanBaseUrl={`${blockExplorerBaseUrl}/tx/${txHash}`}
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
              )} */}

            {/* {acceptBidStep === AcceptBidStep.Complete && token && (
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
                        href={`${reservoirChain?.baseApiUrl}/redirect/sources/${client?.source}/tokens/${token.token?.contract}:${token?.token?.tokenId}/link/v2`}
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
                    href={`${blockExplorerBaseUrl}/tx/${txHash}`}
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
                    }}
                  >
                    Done
                  </Button>
                </Flex>
              </Flex>
            )} */}
          </Modal>
        )
      }}
    </AcceptBidModalRenderer>
  )
}

AcceptBidModal.Custom = AcceptBidModalRenderer
