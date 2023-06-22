import { useFallbackState, useTimeSince } from '../../hooks'
import React, {
  ReactElement,
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from 'react'
import {
  Flex,
  Text,
  Box,
  Button,
  Loader,
  Select,
  CryptoCurrencyIcon,
  Input,
  FormatCurrency,
  FormatWrappedCurrency,
  Popover,
  FormatCryptoCurrency,
} from '../../primitives'
import PseudoInput from '../../primitives/PseudoInput'
import AttributeSelector from '../bid/AttributeSelector'
import { EditBidModalRenderer, EditBidStep } from './EditBidModalRenderer'
import { Modal } from '../Modal'
import TokenPrimitive from '../TokenPrimitive'
import Progress from '../Progress'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCheckCircle,
  faChevronDown,
  faCircleExclamation,
  faClose,
} from '@fortawesome/free-solid-svg-icons'

const ModalCopy = {
  title: 'Edit Offer',
  ctaClose: 'Close',
  ctaConfirm: 'Confirm',
  ctaConvertManually: 'Convert Manually',
  ctaConvertAutomatically: '',
  ctaAwaitingApproval: 'Waiting for approval...',
  ctaAwaitingValidation: 'Waiting for transaction to be validated',
}

type Props = Pick<Parameters<typeof Modal>['0'], 'trigger'> & {
  openState?: [boolean, Dispatch<SetStateAction<boolean>>]
  bidId?: string
  tokenId?: string
  collectionId?: string
  normalizeRoyalties?: boolean
  enableOnChainRoyalties?: boolean
  copyOverrides?: Partial<typeof ModalCopy>
  onClose?: (data: any, currentStep: EditBidStep) => void
  onEditBidComplete?: (data: any) => void
  onEditBidError?: (error: Error, data: any) => void
}

export function EditBidModal({
  openState,
  bidId,
  tokenId,
  collectionId,
  trigger,
  normalizeRoyalties,
  copyOverrides,
  onClose,
  onEditBidComplete,
  onEditBidError,
}: Props): ReactElement {
  const copy: typeof ModalCopy = { ...ModalCopy, ...copyOverrides }
  const [open, setOpen] = useFallbackState(
    openState ? openState[0] : false,
    openState
  )

  return (
    <EditBidModalRenderer
      bidId={bidId}
      tokenId={tokenId}
      collectionId={collectionId}
      open={open}
      normalizeRoyalties={normalizeRoyalties}
    >
      {({
        loading,
        bid,
        attributes,
        trait,
        isOracleOrder,
        isTokenBid,
        bidAmount,
        bidAmountUsd,
        token,
        collection,
        editBidStep,
        transactionError,
        hasEnoughNativeCurrency,
        hasEnoughWrappedCurrency,
        amountToWrap,
        balance,
        wrappedBalance,
        wrappedContractName,
        wrappedContractAddress,
        canAutomaticallyConvert,
        convertLink,
        royaltyBps,
        expirationOptions,
        expirationOption,
        usdPrice,
        stepData,
        setTrait,
        setBidAmount,
        setExpirationOption,
        editBid,
      }) => {
        const [attributeSelectorOpen, setAttributeSelectorOpen] =
          useState(false)

        const [attributesSelectable, setAttributesSelectable] = useState(false)
        const tokenCount = collection?.tokenCount
          ? +collection.tokenCount
          : undefined

        const itemImage = isTokenBid
          ? bid?.criteria?.data?.token?.image || token?.token?.imageSmall
          : bid?.criteria?.data?.collection?.image || collection?.image

        const previousBidsExpiration = useTimeSince(bid?.expiration)

        useEffect(() => {
          if (editBidStep === EditBidStep.Complete && onEditBidComplete) {
            const data = {
              bid,
              stepData: stepData,
            }
            onEditBidComplete(data)
          }
        }, [editBidStep])

        useEffect(() => {
          if (transactionError && onEditBidError) {
            const data = {
              bid,
              stepData: stepData,
            }
            onEditBidError(transactionError, data)
          }
        }, [transactionError])

        useEffect(() => {
          if (open && attributes) {
            let attributeCount = 0
            for (let i = 0; i < attributes.length; i++) {
              attributeCount += attributes[i].attributeCount || 0
              if (attributeCount >= 2000) {
                break
              }
            }
            if (attributeCount >= 2000) {
              setAttributesSelectable(false)
            } else {
              setAttributesSelectable(true)
            }
          } else {
            setAttributesSelectable(false)
          }
        }, [open, attributes])

        const isBidAvailable = bid && bid.status === 'active' && !loading

        const isBidEditable =
          bid && bid.status === 'active' && !loading && isOracleOrder

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
                onClose(data, editBidStep)
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
                  Selected offer is no longer available
                </Text>
              </Flex>
            )}
            {!isBidEditable && isBidAvailable && (
              <Flex
                direction="column"
                justify="center"
                css={{ px: '$4', py: '$6' }}
              >
                <Text style="h6" css={{ textAlign: 'center' }}>
                  Selected offer is not an oracle order, so cannot be edited.
                </Text>
              </Flex>
            )}
            {isBidEditable && editBidStep === EditBidStep.Edit && (
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
                    img={itemImage}
                    name={bid?.criteria?.data?.token?.name}
                    price={bid?.price?.amount?.decimal}
                    priceSubtitle="Price"
                    royaltiesBps={royaltyBps}
                    usdPrice={
                      (bid?.price?.amount?.decimal as number) * (usdPrice || 0)
                    }
                    collection={bid?.criteria?.data?.collection?.name || ''}
                    currencyContract={bid?.price?.currency?.contract}
                    currencyDecimals={bid?.price?.currency?.decimals}
                    currencySymbol={bid?.price?.currency?.symbol}
                    expires={previousBidsExpiration}
                    source={(bid?.source?.icon as string) || ''}
                  />
                </Box>
                <Flex direction="column" css={{ px: '$4', py: '$2' }}>
                  <Flex css={{ mb: '$2' }} justify="between">
                    <Text style="subtitle2" color="subtle" as="p">
                      Set New Offer
                    </Text>
                    {wrappedBalance?.value ? (
                      <Text
                        as={Flex}
                        css={{ gap: '$1' }}
                        align="center"
                        style="tiny"
                      >
                        Balance:{' '}
                        <FormatWrappedCurrency
                          logoWidth={10}
                          textStyle="tiny"
                          amount={wrappedBalance?.value}
                          decimals={wrappedBalance?.decimals}
                          address={wrappedContractAddress}
                          symbol={wrappedBalance?.symbol}
                        />{' '}
                      </Text>
                    ) : null}
                  </Flex>
                  <Flex css={{ gap: '$2' }}>
                    <Text
                      as={Flex}
                      css={{ gap: '$2', flexShrink: 0 }}
                      align="center"
                      style="body1"
                      color="subtle"
                    >
                      <CryptoCurrencyIcon
                        css={{ height: 20 }}
                        address={wrappedContractAddress}
                      />
                      {wrappedContractName}
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
                  {attributes &&
                    attributes.length > 0 &&
                    (attributesSelectable || trait) &&
                    !isTokenBid && (
                      <Flex direction="column" css={{ mb: '$3' }}>
                        <Text
                          as="div"
                          css={{ mb: '$2' }}
                          style="subtitle2"
                          color="subtle"
                        >
                          Attributes
                        </Text>
                        <Popover.Root
                          open={attributeSelectorOpen}
                          onOpenChange={
                            attributesSelectable
                              ? setAttributeSelectorOpen
                              : undefined
                          }
                        >
                          <Popover.Trigger asChild>
                            <PseudoInput>
                              <Flex
                                justify="between"
                                css={{
                                  gap: '$2',
                                  alignItems: 'center',
                                  color: '$neutralText',
                                }}
                              >
                                {trait ? (
                                  <>
                                    <Box
                                      css={{
                                        maxWidth: 385,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                      }}
                                    >
                                      <Text color="accent" style="subtitle1">
                                        {trait?.key}:{' '}
                                      </Text>
                                      <Text style="subtitle1">
                                        {trait?.value}
                                      </Text>
                                    </Box>
                                    <Flex
                                      css={{
                                        alignItems: 'center',
                                        gap: '$2',
                                      }}
                                    >
                                      {trait?.floorAskPrice && (
                                        <Box css={{ flex: 'none' }}>
                                          <FormatCryptoCurrency
                                            amount={trait?.floorAskPrice}
                                            maximumFractionDigits={2}
                                            logoWidth={11}
                                          />
                                        </Box>
                                      )}
                                      <FontAwesomeIcon
                                        style={{
                                          cursor: 'pointer',
                                        }}
                                        onClick={(e) => {
                                          e.preventDefault()
                                          setTrait(undefined)
                                        }}
                                        icon={faClose}
                                        width={16}
                                        height={16}
                                      />
                                    </Flex>
                                  </>
                                ) : (
                                  <>
                                    <Text
                                      css={{
                                        color: '$neutralText',
                                      }}
                                    >
                                      All Attributes
                                    </Text>
                                    <FontAwesomeIcon
                                      icon={faChevronDown}
                                      width={16}
                                      height={16}
                                    />
                                  </>
                                )}
                              </Flex>
                            </PseudoInput>
                          </Popover.Trigger>
                          <Popover.Content sideOffset={-50}>
                            <AttributeSelector
                              attributes={attributes}
                              tokenCount={tokenCount}
                              setTrait={setTrait}
                              setOpen={setAttributeSelectorOpen}
                            />
                          </Popover.Content>
                        </Popover.Root>
                      </Flex>
                    )}
                  <Box css={{ mb: '$3' }}>
                    <Text
                      as="div"
                      css={{ mb: '$2' }}
                      style="subtitle2"
                      color="subtle"
                    >
                      Expiration Date
                    </Text>
                    <Select
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
                  </Box>

                  <Flex
                    css={{
                      gap: '$3',
                      py: '$3',
                    }}
                  >
                    {hasEnoughWrappedCurrency ? (
                      <>
                        <Button
                          onClick={() => {
                            setOpen(false)
                          }}
                          color="secondary"
                          css={{ flex: 1 }}
                        >
                          {copy.ctaClose}
                        </Button>
                        <Button
                          disabled={bidAmount === '' || bidAmount === '0'}
                          onClick={editBid}
                          css={{ flex: 1 }}
                        >
                          {copy.ctaConfirm}
                        </Button>
                      </>
                    ) : (
                      <Box css={{ width: '100%', mt: 'auto' }}>
                        {!hasEnoughNativeCurrency && (
                          <Flex css={{ gap: '$2', mt: 10 }} justify="center">
                            <Text style="body3" color="error">
                              {balance?.symbol || 'ETH'} Balance
                            </Text>
                            <FormatCryptoCurrency
                              amount={balance?.value}
                              symbol={balance?.symbol}
                            />
                          </Flex>
                        )}
                        <Flex
                          css={{
                            gap: '$2',
                            mt: 10,
                            overflow: 'hidden',
                            flexDirection: 'column-reverse',
                            '@bp1': {
                              flexDirection: 'row',
                            },
                          }}
                        >
                          <Button
                            css={{ flex: '1 0 auto' }}
                            color="secondary"
                            onClick={() => {
                              window.open(convertLink, '_blank')
                            }}
                          >
                            {copy.ctaConvertManually}
                          </Button>

                          {canAutomaticallyConvert && (
                            <Button
                              css={{ flex: 1, maxHeight: 44 }}
                              disabled={!hasEnoughNativeCurrency}
                              onClick={editBid}
                            >
                              <Text style="h6" color="button" ellipsify>
                                {copy.ctaConvertAutomatically.length > 0
                                  ? copy.ctaConvertAutomatically
                                  : `Convert ${amountToWrap} ${
                                      balance?.symbol || 'ETH'
                                    } for me`}
                              </Text>
                            </Button>
                          )}
                        </Flex>
                      </Box>
                    )}
                  </Flex>
                </Flex>
              </Flex>
            )}
            {editBidStep === EditBidStep.Approving && (
              <Flex direction="column">
                <Box css={{ p: '$4', borderBottom: '1px solid $borderColor' }}>
                  <TokenPrimitive
                    img={itemImage}
                    name={bid?.criteria?.data?.token?.name}
                    price={Number(bidAmount)}
                    usdPrice={bidAmountUsd}
                    collection={collection?.name || ''}
                    currencyContract={bid?.price?.currency?.contract}
                    currencyDecimals={bid?.price?.currency?.decimals}
                    currencySymbol={bid?.price?.currency?.symbol}
                    expires={`in ${expirationOption.text.toLowerCase()}`}
                    source={(bid?.source?.icon as string) || ''}
                  />
                </Box>
                {!stepData && <Loader css={{ height: 206 }} />}
                {stepData && (
                  <>
                    <Progress
                      title={
                        stepData?.currentStepItem.txHash
                          ? 'Finalizing on blockchain'
                          : 'Approve Reservoir Oracle to update the offer'
                      }
                      txHash={stepData?.currentStepItem.txHash}
                    />
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
            {editBidStep === EditBidStep.Complete && (
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
                  <Box css={{ color: '$successAccent', mb: 24 }}>
                    <FontAwesomeIcon icon={faCheckCircle} size="3x" />
                  </Box>
                  <Text style="h5" css={{ mb: '$4' }}>
                    Offer Updated!
                  </Text>
                  <Text style="body2" color="subtle" css={{ mb: 24 }}>
                    Your offer for{' '}
                    <Text style="body2" color="base">
                      {token?.token?.name}
                    </Text>{' '}
                    has been updated.
                  </Text>
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
    </EditBidModalRenderer>
  )
}

EditBidModal.Custom = EditBidModalRenderer
