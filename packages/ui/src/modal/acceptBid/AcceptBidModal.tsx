import React, {
  Dispatch,
  ReactElement,
  SetStateAction,
  useEffect,
  useMemo,
} from 'react'
import {
  Flex,
  Text,
  Button,
  FormatCurrency,
  Loader,
  FormatCryptoCurrency,
  Box,
  Anchor,
} from '../../primitives'

import { Modal } from '../Modal'
import {
  faCircleExclamation,
  faChevronDown,
  faCube,
  faCircleCheck,
  faEnvelopeOpen,
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
import AcceptBidLineItem from './AcceptBidLineItem'
import { Collapsible } from '../../primitives/Collapsible'
import { ApproveBidCollapsible } from './ApproveBidCollapsible'
import SigninStep from '../SigninStep'
import AcceptBidSummaryLineItem from './AcceptBidSummaryLineItem'

type BidData = {
  tokens?: EnhancedAcceptBidTokenData[]
  bids?: NonNullable<ReturnType<typeof useBids>['data']>
  txHash?: string
  maker?: string
}

const ModalCopy = {
  title: 'Accept Offer',
  ctaAccept: 'Accept',
  ctaAwaitingApproval: 'Waiting for Approval',
  ctaClose: 'Close',
  ctaDone: 'Done',
}

type Props = Pick<Parameters<typeof Modal>['0'], 'trigger'> & {
  openState?: [boolean, Dispatch<SetStateAction<boolean>>]
  tokens: AcceptBidTokenData[]
  normalizeRoyalties?: boolean
  copyOverrides?: Partial<typeof ModalCopy>
  onBidAccepted?: (data: BidData) => void
  onClose?: (
    data: BidData,
    stepData: AcceptBidStepData | null,
    currentStep: AcceptBidStep
  ) => void
  onBidAcceptError?: (error: Error, data: BidData) => void
  onCurrentStepUpdate?: (data: AcceptBidStepData) => void
}

export function AcceptBidModal({
  openState,
  trigger,
  tokens,
  normalizeRoyalties,
  copyOverrides,
  onBidAccepted,
  onClose,
  onBidAcceptError,
  onCurrentStepUpdate,
}: Props): ReactElement {
  const [open, setOpen] = useFallbackState(
    openState ? openState[0] : false,
    openState
  )
  const copy: typeof ModalCopy = { ...ModalCopy, ...copyOverrides }

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
        usdPrices,
        prices,
        tokensData,
        address,
        blockExplorerBaseUrl,
        stepData,
        acceptBid,
      }) => {
        const client = useReservoirClient()
        const chain = client?.currentChain()

        const baseApiUrl = chain?.baseApiUrl

        useEffect(() => {
          if (acceptBidStep === AcceptBidStep.Complete && onBidAccepted) {
            const data: BidData = {
              tokens: tokensData,
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

        const bidCount = useMemo(
          () =>
            tokensData.reduce(
              (total, tokenData) => (total += tokenData.bidsPath.length),
              0
            ),
          [tokensData]
        )

        const transfersTxHashes =
          stepData?.currentStep?.items?.reduce((txHashes, item) => {
            item.transfersData?.forEach((transferData) => {
              if (transferData.txHash) {
                txHashes.add(transferData.txHash)
              }
            })
            return txHashes
          }, new Set<string>()) || []
        const totalSales = Array.from(transfersTxHashes).length
        const failedSales =
          totalSales - (stepData?.currentStep?.items?.length || 0)
        const successfulSales = totalSales - failedSales

        return (
          <Modal
            trigger={trigger}
            title={copy.title}
            open={open}
            onOpenChange={(open) => {
              if (!open && onClose) {
                const data: BidData = {
                  tokens: tokensData,
                  maker: address,
                }
                onClose(data, stepData, acceptBidStep)
              }
              setOpen(open)
            }}
            loading={loading}
          >
            {acceptBidStep === AcceptBidStep.Unavailable && !loading && (
              <Flex direction="column" css={{ mt: 80 }}>
                <Box css={{ color: '$neutralSolidHover', m: '0 auto' }}>
                  <FontAwesomeIcon
                    icon={faEnvelopeOpen}
                    style={{ height: 24, width: 24 }}
                  />
                </Box>
                <Text
                  style="body2"
                  css={{ mt: '$2', mb: 74, textAlign: 'center' }}
                >
                  Offers are no longer available
                </Text>
                <Button
                  onClick={() => setOpen(false)}
                  css={{
                    m: '$4',
                    flex: 1,
                  }}
                >
                  {copy.ctaClose}
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
                    {bidCount > 1 ? `${bidCount} Items` : 'Item'}
                  </Text>
                  <Text style="subtitle2" color="subtle">
                    Total Offer Value
                  </Text>
                </Flex>
                {tokensData.map(({ tokenData, bidsPath }, i) => {
                  if (!bidsPath || !bidsPath.length) {
                    return (
                      <AcceptBidLineItem
                        key={i}
                        token={{
                          name: tokenData?.token?.name || '',
                          id: tokenData?.token?.tokenId || '',
                        }}
                        collection={{
                          id: tokenData?.token?.collection?.id || '',
                          name: tokenData?.token?.collection?.name || '',
                        }}
                        img={
                          tokenData?.token?.imageSmall ||
                          tokenData?.token?.collection?.image ||
                          ''
                        }
                      />
                    )
                  } else {
                    return bidsPath.map((bidPath) => (
                      <AcceptBidLineItem
                        key={i}
                        token={{
                          name: tokenData?.token?.name || '',
                          id: tokenData?.token?.tokenId || '',
                        }}
                        collection={{
                          id: tokenData?.token?.collection?.id || '',
                          name: tokenData?.token?.collection?.name || '',
                        }}
                        img={
                          tokenData?.token?.imageSmall ||
                          tokenData?.token?.collection?.image ||
                          ''
                        }
                        netAmount={bidPath.quote}
                        price={bidPath.totalPrice}
                        fees={bidPath.builtInFees}
                        currency={bidPath.currency}
                        decimals={bidPath.currencyDecimals}
                        sourceImg={
                          bidPath.source
                            ? `${baseApiUrl}/redirect/sources/${bidPath.source}/logo/v2`
                            : ''
                        }
                      />
                    ))
                  }
                })}

                {prices.map((price, i) => (
                  <Collapsible
                    key={i}
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
                          <Text
                            css={{ ml: 'auto' }}
                            style="subtitle2"
                            color="subtle"
                          >
                            -
                          </Text>
                          <FormatCryptoCurrency
                            amount={price.royalty}
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
                          <Text
                            css={{ ml: 'auto' }}
                            style="subtitle2"
                            color="subtle"
                          >
                            -
                          </Text>
                          <FormatCryptoCurrency
                            amount={price.marketplaceFee}
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
                  css={{
                    flex: 1,
                    m: '$4',
                  }}
                  color="primary"
                  onClick={acceptBid}
                >
                  {copy.ctaAccept}
                </Button>
              </Flex>
            )}
            {acceptBidStep === AcceptBidStep.Auth && !loading && (
              <Flex direction="column">
                <AcceptBidSummaryLineItem
                  tokensData={tokensData}
                  usdPrices={usdPrices}
                  prices={prices}
                  chain={chain}
                />
                <SigninStep css={{ mt: 48, mb: 60, gap: 20 }} />
                <Button disabled={true} css={{ m: '$4' }}>
                  <Loader />
                  {copy.ctaAwaitingApproval}
                </Button>
              </Flex>
            )}
            {acceptBidStep === AcceptBidStep.ApproveMarketplace && !loading && (
              <Flex direction="column">
                <AcceptBidSummaryLineItem
                  tokensData={tokensData}
                  usdPrices={usdPrices}
                  prices={prices}
                  chain={chain}
                />
                <Text style="h6" css={{ m: '$4', textAlign: 'center' }}>
                  Confirm Selling
                </Text>
                {stepData?.steps.map((step) =>
                  step?.items && step.items.length > 0 ? (
                    <ApproveBidCollapsible
                      key={step.id}
                      step={step}
                      tokensData={tokensData}
                      chain={chain}
                      isCurrentStep={stepData.currentStep.id === step.id}
                      open={stepData.currentStep.id === step.id}
                    />
                  ) : null
                )}

                <Button disabled={true} css={{ m: '$4' }}>
                  <Loader />
                  {copy.ctaAwaitingApproval}
                </Button>
              </Flex>
            )}

            {acceptBidStep === AcceptBidStep.Finalizing && !loading && (
              <Flex
                direction="column"
                justify="center"
                css={{
                  gap: '$4',
                  pb: '$5',
                }}
              >
                <AcceptBidSummaryLineItem
                  tokensData={tokensData}
                  usdPrices={usdPrices}
                  prices={prices}
                  chain={chain}
                />
                <Text style="h6" css={{ textAlign: 'center' }}>
                  Finalizing on blockchain
                </Text>
                <Text
                  style="subtitle2"
                  color="subtle"
                  css={{ textAlign: 'center', px: '$4' }}
                >
                  You can close this modal while it finalizes on the blockchain.
                  The transaction will continue in the background.
                </Text>
                <Box
                  css={{
                    color: '$neutralSolid',
                    width: 32,
                    height: 32,
                    m: '0 auto',
                  }}
                >
                  <FontAwesomeIcon
                    icon={faCube}
                    style={{ width: 32, height: 32 }}
                  />
                </Box>
              </Flex>
            )}

            {acceptBidStep === AcceptBidStep.Complete && !loading && (
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
                  <Box
                    css={{
                      color: failedSales ? '$errorAccent' : '$successAccent',
                    }}
                  >
                    <FontAwesomeIcon
                      icon={failedSales ? faCircleExclamation : faCircleCheck}
                      fontSize={32}
                    />
                  </Box>
                  <Text style="h5" css={{ my: 24 }}>
                    {failedSales
                      ? `${successfulSales} ${
                          successfulSales > 1 ? 'items' : 'item'
                        } sold, ${failedSales} ${
                          failedSales > 1 ? 'items' : 'item'
                        } failed`
                      : `${totalSales > 1 ? 'Offers' : 'Offer'} accepted!`}
                  </Text>
                  <Flex direction="column" css={{ gap: '$2', mb: '$3' }}>
                    {stepData?.currentStep?.items?.map((item) => {
                      const txHash = item.txHash
                        ? `${item.txHash.slice(0, 4)}...${item.txHash.slice(
                            -4
                          )}`
                        : ''
                      return (
                        <Anchor
                          href={`${blockExplorerBaseUrl}/tx/${item?.txHash}`}
                          color="primary"
                          weight="medium"
                          target="_blank"
                          css={{ fontSize: 12 }}
                        >
                          View transaction: {txHash}
                        </Anchor>
                      )
                    })}
                  </Flex>
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
                    {copy.ctaDone}
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
