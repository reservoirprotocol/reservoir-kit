import React, { ReactElement, useEffect, useState, useRef } from 'react'
import { styled } from '../../../stitches.config'
import {
  Flex,
  Text,
  FormatWEth,
  Box,
  Input,
  Select,
  DateInput,
  Button,
  FormatEth,
  ErrorWell,
  Loader,
  FormatCurrency,
} from '../../primitives'

import { Modal, ModalSize } from '../Modal'
import {
  TokenOfferModalRenderer,
  TokenOfferStep,
} from './TokenOfferModalRenderer'
import TokenStats from './TokenStats'
import WEthIcon from '../../img/WEthIcon'
import dayjs from 'dayjs'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendar } from '@fortawesome/free-solid-svg-icons'
import Flatpickr from 'react-flatpickr'
import TransactionProgress from '../../modal/TransactionProgress'
import ProgressBar from '../../modal/ProgressBar'
import getLocalMarketplaceData from '../../lib/getLocalMarketplaceData'
import WethApproval from '../../img/WethApproval'
import OfferSubmitted from '../../img/OfferSubmitted'
import TransactionBidDetails from './TransactionBidDetails'

type Props = Pick<Parameters<typeof Modal>['0'], 'trigger'> & {
  tokenId?: string
  collectionId?: string
  onViewOffers?: () => any
  onBidComplete?: (data: any) => void
  onBidError?: (error: Error, data: any) => void
}

function titleForStep(step: TokenOfferStep) {
  switch (step) {
    case TokenOfferStep.SetPrice:
      return 'Make an Offer'
    case TokenOfferStep.Offering:
      return 'Complete Offer'
    case TokenOfferStep.Complete:
      return 'Offer Submitted'
  }
}

const ContentContainer = styled(Flex, {
  width: '100%',
  flexDirection: 'column',
  '@bp1': {
    flexDirection: 'row',
  },
})

const MainContainer = styled(Flex, {
  flex: 1,
  borderColor: '$borderColor',
  borderTopWidth: 1,
  borderLeftWidth: 0,
  '@bp1': {
    borderTopWidth: 0,
    borderLeftWidth: 1,
  },

  defaultVariants: {
    direction: 'column',
  },
})

const minimumDate = dayjs().add(1, 'h').format('DD/MM/YYYY h:mm A')
export function TokenOfferModal({
  trigger,
  tokenId,
  collectionId,
  onViewOffers,
}: Props): ReactElement {
  const [open, setOpen] = useState(false)
  const datetimeElement = useRef<Flatpickr | null>(null)
  const [stepTitle, setStepTitle] = useState('')
  const [localMarketplace, setLocalMarketplace] = useState<ReturnType<
    typeof getLocalMarketplaceData
  > | null>(null)

  useEffect(() => {
    setLocalMarketplace(getLocalMarketplaceData())
  }, [])

  return (
    <TokenOfferModalRenderer
      open={open}
      tokenId={tokenId}
      collectionId={collectionId}
    >
      {({
        token,
        collection,
        tokenOfferStep,
        expirationOption,
        expirationOptions,
        wethBalance,
        bidAmount,
        bidAmountUsd,
        hasEnoughEth,
        hasEnoughWEth,
        ethAmountToWrap,
        balance,
        wethUniswapLink,
        transactionError,
        stepData,
        bidData,
        isBanned,
        setBidAmount,
        setExpirationOption,
        setTokenOfferStep,
        placeBid,
      }) => {
        const [expirationDate, setExpirationDate] = useState('')

        const itemImage =
          token && token.token?.image
            ? token.token?.image
            : (collection?.metadata?.imageUrl as string)

        useEffect(() => {
          if (stepData) {
            switch (stepData.currentStep.kind) {
              case 'signature': {
                setStepTitle('Confirm Offer')
                break
              }
              default: {
                setStepTitle(stepData.currentStep.action)
                break
              }
            }
          }
        }, [stepData])

        useEffect(() => {
          if (expirationOption && expirationOption.relativeTime) {
            const newExpirationTime = expirationOption.relativeTimeUnit
              ? dayjs().add(
                  expirationOption.relativeTime,
                  expirationOption.relativeTimeUnit
                )
              : dayjs.unix(expirationOption.relativeTime)
            setExpirationDate(newExpirationTime.format('DD/MM/YYYY h:mm A'))
          } else {
            setExpirationDate('')
          }
        }, [expirationOption])

        return (
          <Modal
            size={ModalSize.LG}
            trigger={trigger}
            title={titleForStep(tokenOfferStep)}
            open={open}
            onOpenChange={(open) => {
              setOpen(open)
            }}
            loading={!collection}
            onPointerDownOutside={(e) => {
              if (
                e.target instanceof Element &&
                datetimeElement.current?.flatpickr?.calendarContainer &&
                datetimeElement.current.flatpickr.calendarContainer.contains(
                  e.target
                )
              ) {
                e.preventDefault()
              }
            }}
          >
            {tokenOfferStep === TokenOfferStep.SetPrice && collection && (
              <ContentContainer>
                <TokenStats
                  token={token ? token : undefined}
                  collection={collection}
                />
                <MainContainer css={{ p: '$4' }}>
                  {isBanned && (
                    <ErrorWell
                      message="Token is not tradable on OpenSea"
                      css={{ mb: '$2', p: '$2', borderRadius: 4 }}
                    />
                  )}
                  <Flex justify="between">
                    <Text style="tiny">Offer Amount</Text>
                    <Text
                      as={Flex}
                      css={{ gap: '$1' }}
                      align="center"
                      style="tiny"
                    >
                      Balance:{' '}
                      <FormatWEth
                        logoWidth={10}
                        textStyle="tiny"
                        amount={wethBalance}
                      />{' '}
                    </Text>
                  </Flex>
                  <Flex css={{ mt: '$2', gap: 20 }}>
                    <Text
                      as={Flex}
                      css={{ gap: '$2', ml: '$3', flexShrink: 0 }}
                      align="center"
                      style="body1"
                      color="subtle"
                    >
                      <Box css={{ width: 'auto', height: 20 }}>
                        <WEthIcon />
                      </Box>
                      WETH
                    </Text>
                    <Input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => {
                        setBidAmount(e.target.value)
                      }}
                      placeholder="Enter price here"
                      containerCss={{
                        width: '100%',
                      }}
                      css={{
                        color: '$neutralText',
                        textAlign: 'left',
                      }}
                    />
                  </Flex>
                  <FormatCurrency
                    css={{
                      marginLeft: 'auto',
                      mt: '$2',
                      display: 'inline-block',
                      minHeight: 15,
                    }}
                    style="tiny"
                    amount={bidAmountUsd}
                  />
                  <Text as={Box} css={{ mt: '$4', mb: '$2' }} style="tiny">
                    Expiration Date
                  </Text>
                  <Flex css={{ gap: '$2' }}>
                    <Select
                      css={{ width: 160 }}
                      value={expirationOption?.text || ''}
                      onValueChange={(value: string) => {
                        const option = expirationOptions.find(
                          (option) => option.value == value
                        )
                        if (option) {
                          setExpirationOption(option)
                        }
                      }}
                    >
                      {expirationOptions.map((option) => (
                        <Select.Item key={option.text} value={option.value}>
                          <Select.ItemText>{option.text}</Select.ItemText>
                        </Select.Item>
                      ))}
                    </Select>
                    <DateInput
                      ref={datetimeElement}
                      icon={
                        <FontAwesomeIcon
                          icon={faCalendar}
                          width={14}
                          height={16}
                        />
                      }
                      value={expirationDate}
                      options={{
                        minDate: minimumDate,
                        enableTime: true,
                        minuteIncrement: 1,
                      }}
                      defaultValue={expirationDate}
                      onChange={(e: any) => {
                        if (Array.isArray(e)) {
                          const customOption = expirationOptions.find(
                            (option) => option.value === 'custom'
                          )
                          if (customOption) {
                            setExpirationOption({
                              ...customOption,
                              relativeTime: dayjs(e[0]).unix(),
                            })
                          }
                        }
                      }}
                      containerCss={{
                        width: '100%',
                      }}
                    />
                  </Flex>
                  {bidAmount === '' && (
                    <Button disabled={true} css={{ width: '100%', mt: 'auto' }}>
                      Enter a Price
                    </Button>
                  )}

                  {bidAmount !== '' && hasEnoughWEth && (
                    <Button
                      onClick={placeBid}
                      css={{ width: '100%', mt: 'auto' }}
                    >
                      {token && token.token
                        ? 'Make an Offer'
                        : 'Make a collection Offer'}
                    </Button>
                  )}

                  {bidAmount !== '' && !hasEnoughWEth && (
                    <Box css={{ width: '100%', mt: 'auto' }}>
                      {!hasEnoughEth && (
                        <Flex css={{ gap: '$2', mt: 10 }} justify="center">
                          <Text style="body2" color="error">
                            Insufficient ETH Balance
                          </Text>
                          <FormatEth amount={balance} />
                        </Flex>
                      )}
                      <Flex css={{ gap: '$2', mt: 10, overflow: 'hidden' }}>
                        <Button
                          css={{ flex: '1 0 auto' }}
                          color="secondary"
                          onClick={() => {
                            window.open(wethUniswapLink, '_blank')
                          }}
                        >
                          Convert Manually
                        </Button>
                        <Button
                          css={{ flex: 1, maxHeight: 44 }}
                          disabled={!hasEnoughEth}
                          onClick={placeBid}
                        >
                          <Text style="h6" ellipsify>
                            Convert {ethAmountToWrap} ETH for me
                          </Text>
                        </Button>
                      </Flex>
                    </Box>
                  )}
                </MainContainer>
              </ContentContainer>
            )}

            {tokenOfferStep === TokenOfferStep.Offering && collection && (
              <ContentContainer>
                <TransactionBidDetails
                  token={token ? token : undefined}
                  collection={collection}
                  bidData={bidData}
                />
                <MainContainer css={{ p: '$4' }}>
                  <ProgressBar
                    value={stepData?.stepProgress || 0}
                    max={stepData?.totalSteps || 0}
                  />
                  {transactionError && <ErrorWell css={{ mt: 24 }} />}
                  {stepData && (
                    <>
                      <Text
                        css={{ textAlign: 'center', mt: 48, mb: 28 }}
                        style="subtitle1"
                      >
                        {stepTitle}
                      </Text>
                      {stepData.currentStep.kind === 'signature' && (
                        <TransactionProgress
                          justify="center"
                          fromImg={itemImage || ''}
                          toImg={localMarketplace?.icon || ''}
                        />
                      )}
                      {stepData.currentStep.kind !== 'signature' && (
                        <WethApproval style={{ margin: '0 auto' }} />
                      )}
                      <Text
                        css={{
                          textAlign: 'center',
                          mt: 24,
                          maxWidth: 395,
                          mx: 'auto',
                          mb: '$4',
                        }}
                        style="body3"
                        color="subtle"
                      >
                        {stepData?.currentStep.description}
                      </Text>
                    </>
                  )}
                  {!stepData && (
                    <Flex
                      css={{ height: '100%' }}
                      justify="center"
                      align="center"
                    >
                      <Loader />
                    </Flex>
                  )}
                  {!transactionError && (
                    <Button css={{ width: '100%', mt: 'auto' }} disabled={true}>
                      <Loader />
                      Waiting for Approval
                    </Button>
                  )}
                  {transactionError && (
                    <Flex css={{ mt: 'auto', gap: 10 }}>
                      <Button
                        color="secondary"
                        css={{ flex: 1 }}
                        onClick={() =>
                          setTokenOfferStep(TokenOfferStep.SetPrice)
                        }
                      >
                        Edit Bid
                      </Button>
                      <Button css={{ flex: 1 }} onClick={placeBid}>
                        Retry
                      </Button>
                    </Flex>
                  )}
                </MainContainer>
              </ContentContainer>
            )}

            {tokenOfferStep === TokenOfferStep.Complete && (
              <Flex direction="column" align="center" css={{ p: '$4' }}>
                <Text style="h5" css={{ textAlign: 'center', mt: 56 }}>
                  Offer Submitted!
                </Text>
                <OfferSubmitted style={{ marginTop: 30, marginBottom: 84 }} />
                {onViewOffers ? (
                  <Button css={{ width: '100%' }} onClick={onViewOffers}>
                    View Offers
                  </Button>
                ) : (
                  <Button
                    css={{ width: '100%' }}
                    onClick={() => setOpen(false)}
                  >
                    Close
                  </Button>
                )}
              </Flex>
            )}
          </Modal>
        )
      }}
    </TokenOfferModalRenderer>
  )
}

TokenOfferModal.Custom = TokenOfferModalRenderer
