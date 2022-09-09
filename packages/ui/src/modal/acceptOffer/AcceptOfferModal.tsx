import React, { ReactElement, useEffect, useState } from 'react'

import {
  Flex,
  Box,
  Text,
  Anchor,
  Button,
  FormatEth,
  FormatCurrency,
  Loader,
} from '../../primitives'

// @ts-ignore
import addFundsImage from 'url:../../../assets/transferFunds.svg'
import { Progress } from './Progress'
import { Modal } from '../Modal'
import {
  faCircleExclamation,
  faCheckCircle,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import TokenLineItem from '../TokenLineItem'
import {
  AcceptOfferStep,
  AcceptOfferModalRenderer,
} from './AcceptOfferModalRenderer'
import Fees from '../Fees'

type PurchaseData = {
  tokenId?: string
  collectionId?: string
  txHash?: string
  maker?: string
}

type Props = Pick<Parameters<typeof Modal>['0'], 'trigger'> & {
  tokenId?: string
  collectionId?: string
  onGoToToken?: () => any
  onOfferAccepted?: (data: PurchaseData) => void
  onAcceptanceError?: (error: Error, data: PurchaseData) => void
  onClose?: () => void
} & (
    | {
        referrerFeeBps: number
        referrer: string
      }
    | {
        referrerFeeBps?: undefined
        referrer?: undefined
      }
  )

function titleForStep(step: AcceptOfferStep) {
  switch (step) {
    case AcceptOfferStep.Unavailable:
      return 'Selected item is no longer available'
    default:
      return 'Accept Offer'
  }
}

export function AcceptOfferModal({
  trigger,
  tokenId,
  collectionId,
  referrer,
  referrerFeeBps,
  onOfferAccepted,
  onAcceptanceError,
  onClose,
  onGoToToken,
}: Props): ReactElement {
  const [open, setOpen] = useState(false)
  // const { copy: copyToClipboard, copied } = useCopyToClipboard()

  return (
    <AcceptOfferModalRenderer
      open={open}
      tokenId={tokenId}
      collectionId={collectionId}
      referrer={referrer}
      referrerFeeBps={referrerFeeBps}
    >
      {({
        token,
        collection,
        totalPrice,
        referrerFee,
        fees,
        acceptOfferStep,
        transactionError,
        txHash,
        feeUsd,
        totalUsd,
        ethUsdPrice,
        address,
        etherscanBaseUrl,
        acceptOffer,
        setAcceptOfferStep,
      }) => {
        const title = titleForStep(acceptOfferStep)

        useEffect(() => {
          if (acceptOfferStep === AcceptOfferStep.Complete && onOfferAccepted) {
            const data: PurchaseData = {
              tokenId: tokenId,
              collectionId: collectionId,
              maker: address,
            }
            if (txHash) {
              data.txHash = txHash
            }
            onOfferAccepted(data)
          }
        }, [acceptOfferStep])

        useEffect(() => {
          if (transactionError && onAcceptanceError) {
            const data: PurchaseData = {
              tokenId: tokenId,
              collectionId: collectionId,
              maker: address,
            }
            onAcceptanceError(transactionError, data)
          }
        }, [transactionError])

        return (
          <Modal
            trigger={trigger}
            title={title}
            open={open}
            onOpenChange={(open) => setOpen(open)}
            loading={!token}
          >
            {acceptOfferStep === AcceptOfferStep.Unavailable && token && (
              <Flex direction="column">
                <TokenLineItem
                  tokenDetails={token}
                  collection={collection}
                  usdConversion={ethUsdPrice || 0}
                  isUnavailable={true}
                  isOffer={true}
                />
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

            {acceptOfferStep === AcceptOfferStep.Checkout && token && (
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
                      Oops, something went wrong. Please try again.
                    </Text>
                  </Flex>
                )}
                <TokenLineItem
                  tokenDetails={token}
                  collection={collection}
                  usdConversion={ethUsdPrice || 0}
                  isOffer={true}
                />
                <Fees fees={fees} />
                {referrerFee > 0 && (
                  <>
                    <Flex
                      align="center"
                      justify="between"
                      css={{ pt: '$4', px: '$4' }}
                    >
                      <Text style="subtitle2">Referral Fee</Text>
                      <FormatEth amount={referrerFee} />
                    </Flex>
                    <Flex justify="end">
                      <FormatCurrency
                        amount={feeUsd}
                        color="subtle"
                        css={{ pr: '$4' }}
                      />
                    </Flex>
                  </>
                )}

                <Flex align="center" justify="between" css={{ px: '$4' }}>
                  <Text style="h6">You Get</Text>
                  <FormatEth textStyle="h6" amount={totalPrice} />
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
                  onClick={acceptOffer}
                >
                  Accept
                </Button>
              </Flex>
            )}

            {(acceptOfferStep === AcceptOfferStep.Confirming ||
              acceptOfferStep === AcceptOfferStep.Finalizing) &&
              token && (
                <Flex direction="column">
                  <TokenLineItem
                    tokenDetails={token}
                    collection={collection}
                    usdConversion={ethUsdPrice || 0}
                    isOffer={true}
                  />
                  <Progress
                    acceptOfferStep={acceptOfferStep}
                    etherscanBaseUrl={`${etherscanBaseUrl}/tx/${txHash}`}
                  />
                  <Button disabled={true} css={{ m: '$4' }}>
                    <Loader />
                    {acceptOfferStep === AcceptOfferStep.Confirming
                      ? 'Waiting for approval...'
                      : 'Waiting for transaction to be validated'}
                  </Button>
                </Flex>
              )}

            {acceptOfferStep === AcceptOfferStep.Complete && token && (
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
                    Offer accepted!
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
                        href={`https://dev.reservoir.market/${token.token?.contract}/${token?.token?.tokenId}`}
                        target="_blank"
                      >
                        {token?.token?.name
                          ? token?.token?.name
                          : `#${token?.token?.tokenId}`}
                      </Anchor>{' '}
                      from the{' '}
                      <Anchor
                        color="primary"
                        weight="medium"
                        css={{ fontSize: 12 }}
                        href={`https://dev.reservoir.market/collections/${token.token?.contract}`}
                        target="_blank"
                      >
                        {token?.token?.collection?.name}
                      </Anchor>
                    </Text>
                  </Flex>
                  <Anchor
                    color="primary"
                    weight="medium"
                    css={{ fontSize: 12 }}
                    href={`${etherscanBaseUrl}/tx/${txHash}`}
                    target="_blank"
                  >
                    View on Etherscan
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
                  {!!onGoToToken ? (
                    <>
                      <Button
                        onClick={() => {
                          setOpen(false)
                          if (!onClose) return
                          onClose()
                        }}
                        css={{ flex: 1 }}
                        color="ghost"
                      >
                        Close
                      </Button>
                      <Button
                        style={{ flex: 1 }}
                        color="primary"
                        onClick={() => {
                          onGoToToken()
                          if (!onClose) return
                          onClose()
                        }}
                      >
                        Go to Token
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => {
                        setOpen(false)
                        if (!onClose) return
                        onClose()
                      }}
                      style={{ flex: 1 }}
                      color="primary"
                    >
                      Close
                    </Button>
                  )}
                </Flex>
              </Flex>
            )}
          </Modal>
        )
      }}
    </AcceptOfferModalRenderer>
  )
}

AcceptOfferModal.Custom = AcceptOfferModalRenderer
