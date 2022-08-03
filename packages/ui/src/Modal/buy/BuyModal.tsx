import React, { ReactElement, useEffect, useState } from 'react'
import { useCopyToClipboard } from '../../hooks'

import {
  Flex,
  Box,
  Text,
  Input,
  Anchor,
  Button,
  FormatEth,
  FormatCurrency,
  Loader,
} from '../../primitives'

import addFundsImage from 'url:../../../assets/transferFunds.svg'
import { Progress } from './Progress'
import Popover from '../../primitives/Popover'
import { Modal } from '../Modal'
import {
  faCopy,
  faCircleExclamation,
  faCheckCircle,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import TokenLineItem from '../TokenLineItem'
import { BuyModalRenderer, BuyStep } from './BuyModalRenderer'

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
  onPurchaseComplete?: (data: PurchaseData) => void
  onPurchaseError?: (error: Error, data: PurchaseData) => void
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

function titleForStep(step: BuyStep) {
  switch (step) {
    case BuyStep.AddFunds:
      return 'Add Funds'
    case BuyStep.Unavailable:
      return 'Selected item is no longer Available'
    default:
      return 'Complete Checkout'
  }
}

export function BuyModal({
  trigger,
  tokenId,
  collectionId,
  referrer,
  referrerFeeBps,
  onPurchaseComplete,
  onPurchaseError,
  onClose,
  onGoToToken,
}: Props): ReactElement {
  const [open, setOpen] = useState(false)
  const { copy: copyToClipboard, copied } = useCopyToClipboard()

  return (
    <BuyModalRenderer
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
        buyStep,
        transactionError,
        hasEnoughEth,
        txHash,
        feeUsd,
        totalUsd,
        ethUsdPrice,
        isBanned,
        balance,
        address,
        etherscanBaseUrl,
        buyToken,
        setBuyStep,
      }) => {
        const title = titleForStep(buyStep)

        useEffect(() => {
          if (buyStep === BuyStep.Complete && onPurchaseComplete) {
            const data: PurchaseData = {
              tokenId: tokenId,
              collectionId: collectionId,
              maker: address,
            }
            if (txHash) {
              data.txHash = txHash
            }
            onPurchaseComplete(data)
          }
        }, [buyStep])

        useEffect(() => {
          if (transactionError && onPurchaseError) {
            const data: PurchaseData = {
              tokenId: tokenId,
              collectionId: collectionId,
              maker: address,
            }
            onPurchaseError(transactionError, data)
          }
        }, [transactionError])

        return (
          <Modal
            trigger={trigger}
            title={title}
            onBack={
              buyStep == BuyStep.AddFunds
                ? () => {
                    setBuyStep(BuyStep.Checkout)
                  }
                : null
            }
            open={open}
            onOpenChange={(open) => {
              setOpen(open)
            }}
            loading={!token}
          >
            {buyStep === BuyStep.Unavailable && token && (
              <Flex direction="column">
                <TokenLineItem
                  token={token}
                  collection={collection}
                  isSuspicious={isBanned}
                  usdConversion={ethUsdPrice || 0}
                  isUnavailable={true}
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

            {buyStep === BuyStep.Checkout && token && (
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
                  token={token}
                  collection={collection}
                  usdConversion={ethUsdPrice || 0}
                  isSuspicious={isBanned}
                />
                {referrerFeeBps && (
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

                <Flex
                  align="center"
                  justify="between"
                  css={{ pt: '$4', px: '$4' }}
                >
                  <Text style="h6">Total</Text>
                  <FormatEth textStyle="h6" amount={totalPrice} />
                </Flex>
                <Flex justify="end">
                  <FormatCurrency
                    amount={totalUsd}
                    color="subtle"
                    css={{ mr: '$4' }}
                  />
                </Flex>

                <Box css={{ p: '$4', width: '100%' }}>
                  {hasEnoughEth ? (
                    <Button
                      onClick={buyToken}
                      css={{ width: '100%' }}
                      color="primary"
                    >
                      Checkout
                    </Button>
                  ) : (
                    <Flex direction="column" align="center">
                      <Flex align="center" css={{ mb: '$3' }}>
                        <Text css={{ mr: '$3' }} color="error" style="body2">
                          Insufficient Balance
                        </Text>

                        <FormatEth amount={balance} textStyle="body2" />
                      </Flex>

                      <Button
                        onClick={() => {
                          setBuyStep(BuyStep.AddFunds)
                        }}
                        css={{ width: '100%' }}
                      >
                        Add Funds
                      </Button>
                    </Flex>
                  )}
                </Box>
              </Flex>
            )}

            {(buyStep === BuyStep.Confirming ||
              buyStep === BuyStep.Finalizing) &&
              token && (
                <Flex direction="column">
                  <TokenLineItem
                    token={token}
                    collection={collection}
                    usdConversion={ethUsdPrice || 0}
                    isSuspicious={isBanned}
                  />
                  <Progress
                    buyStep={buyStep}
                    etherscanBaseUrl={`${etherscanBaseUrl}/tx/${txHash}`}
                  />
                  <Button disabled={true} css={{ m: '$4' }}>
                    <Loader />
                    {buyStep === BuyStep.Confirming
                      ? 'Waiting for approval...'
                      : 'Waiting for transaction to be validated'}
                  </Button>
                </Flex>
              )}

            {buyStep === BuyStep.Complete && token && (
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
                  <Text style="h5" css={{ mb: 24 }}>
                    Congratulations!
                  </Text>
                  <img
                    src={token?.token?.image}
                    style={{ width: 100, height: 100 }}
                  />
                  <Flex css={{ mb: 24, mt: '$2' }} align="center">
                    {!!token.token?.collection?.image && (
                      <Box css={{ mr: '$1' }}>
                        <img
                          src={token.token?.collection?.image}
                          style={{ width: 24, height: 24, borderRadius: '50%' }}
                        />
                      </Box>
                    )}

                    <Text style="subtitle2">{`#${token?.token?.tokenId}`}</Text>
                  </Flex>

                  <Flex css={{ mb: '$2' }} align="center">
                    <Box css={{ color: '$successAccent', mr: '$2' }}>
                      <FontAwesomeIcon icon={faCheckCircle} />
                    </Box>
                    <Text style="body1">
                      Your transaction went through successfully
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
                <Flex css={{ p: '$4' }}>
                  {!!onGoToToken ? (
                    <>
                      <Button
                        onClick={() => {
                          setOpen(false)
                          if (onClose) {
                            onClose()
                          }
                        }}
                        css={{ mr: '$3', flex: 1 }}
                        color="ghost"
                      >
                        Close
                      </Button>
                      <Button
                        style={{ flex: 1 }}
                        color="primary"
                        onClick={() => {
                          onGoToToken()
                          if (onClose) {
                            onClose()
                          }
                        }}
                      >
                        Go to Token
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => {
                        setOpen(false)
                        if (onClose) {
                          onClose()
                        }
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

            {buyStep === BuyStep.AddFunds && token && (
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
                  <img
                    src={addFundsImage}
                    style={{ height: 100, width: 100 }}
                  />
                  <Text style="subtitle1" css={{ my: 24 }}>
                    Transfer funds from an{' '}
                    <Popover
                      content={
                        <Text style={'body2'}>
                          An exchange allows users to buy, sell and trade
                          cryptocurrencies. Popular exchanges include{' '}
                          <Anchor
                            css={{ fontSize: 12 }}
                            href="https://www.coinbase.com/"
                            target="_blank"
                            color="primary"
                          >
                            Coinbase
                          </Anchor>
                          ,{' '}
                          <Anchor
                            css={{ fontSize: 12 }}
                            href="https://crypto.com"
                            target="_blank"
                            color="primary"
                          >
                            Crypto.com
                          </Anchor>{' '}
                          and many others.
                        </Text>
                      }
                    >
                      <Text as="span" color="accent">
                        exchange{' '}
                      </Text>
                    </Popover>{' '}
                    or another wallet to your wallet address below:
                  </Text>
                  <Box css={{ width: '100%', position: 'relative' }}>
                    <Flex
                      css={{
                        pointerEvents: 'none',
                        opacity: copied ? 1 : 0,
                        position: 'absolute',
                        inset: 0,
                        borderRadius: 8,
                        transition: 'all 200ms ease-in-out',
                        pl: '$4',
                        alignItems: 'center',
                        zIndex: 3,
                        textAlign: 'left',
                        background: '$neutralBg',
                      }}
                    >
                      <Text style={'body1'}>Copied Address!</Text>
                    </Flex>
                    <Input
                      readOnly
                      onClick={() => copyToClipboard(address as string)}
                      value={address || ''}
                      css={{
                        color: '$neutralText',
                        textAlign: 'left',
                      }}
                    />
                    <Box
                      css={{
                        position: 'absolute',
                        right: '$3',
                        top: '50%',
                        touchEvents: 'none',
                        transform: 'translateY(-50%)',
                        color: '$neutralText',
                        pointerEvents: 'none',
                      }}
                    >
                      <FontAwesomeIcon icon={faCopy} width={16} height={16} />
                    </Box>
                  </Box>
                </Flex>
                <Button
                  css={{ m: '$4' }}
                  color="primary"
                  onClick={() => copyToClipboard(address as string)}
                >
                  Copy Wallet Address
                </Button>
              </Flex>
            )}
          </Modal>
        )
      }}
    </BuyModalRenderer>
  )
}

BuyModal.Custom = BuyModalRenderer
