import { useFallbackState, useTimeSince } from '../../hooks'
import React, { ReactElement, Dispatch, SetStateAction, useEffect } from 'react'
import { Flex, Text, Box, Button, Loader, Select } from '../../primitives'
import {
  EditListingModalRenderer,
  EditListingStep,
} from './EditListingModalRenderer'
import { Modal } from '../Modal'
import TokenPrimitive from '../TokenPrimitive'
import Progress from '../Progress'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCheckCircle,
  faCircleExclamation,
} from '@fortawesome/free-solid-svg-icons'
import PriceInput from './PriceInput'
import InfoTooltip from '../../primitives/InfoTooltip'
import { zeroAddress } from 'viem'

const ModalCopy = {
  title: 'Edit Listing',
  ctaClose: 'Close',
  ctaConfirm: 'Confirm',
  ctaConvertManually: 'Convert Manually',
  ctaConvertAutomatically: '',
  ctaAwaitingApproval: 'Waiting for approval...',
  ctaAwaitingValidation: 'Waiting for transaction to be validated',
}

type Props = Pick<Parameters<typeof Modal>['0'], 'trigger'> & {
  openState?: [boolean, Dispatch<SetStateAction<boolean>>]
  listingId?: string
  tokenId?: string
  collectionId?: string
  normalizeRoyalties?: boolean
  enableOnChainRoyalties?: boolean
  copyOverrides?: Partial<typeof ModalCopy>
  onClose?: (data: any, currentStep: EditListingStep) => void
  onEditListingComplete?: (data: any) => void
  onEditListingError?: (error: Error, data: any) => void
}

const MINIMUM_AMOUNT = 0.000001

export function EditListingModal({
  openState,
  listingId,
  tokenId,
  collectionId,
  trigger,
  normalizeRoyalties,
  enableOnChainRoyalties = false,
  copyOverrides,
  onClose,
  onEditListingComplete,
  onEditListingError,
}: Props): ReactElement {
  const copy: typeof ModalCopy = { ...ModalCopy, ...copyOverrides }
  const [open, setOpen] = useFallbackState(
    openState ? openState[0] : false,
    openState
  )

  return (
    <EditListingModalRenderer
      listingId={listingId}
      tokenId={tokenId}
      collectionId={collectionId}
      open={open}
      normalizeRoyalties={normalizeRoyalties}
      enableOnChainRoyalties={enableOnChainRoyalties}
    >
      {({
        loading,
        listing,
        token,
        price,
        currency,
        isOracleOrder,
        quantityAvailable,
        collection,
        quantity,
        expirationOption,
        expirationOptions,
        editListingStep,
        transactionError,
        usdPrice,
        totalUsd,
        royaltyBps,
        stepData,
        setPrice,
        setQuantity,
        setExpirationOption,
        editListing,
      }) => {
        const expires = useTimeSince(listing?.expiration)

        const profit =
          (1 - (collection?.royalties?.bps || 0) * 0.0001) *
          (price || 0) *
          quantity
        100

        const updatedTotalUsd = profit * usdPrice

        useEffect(() => {
          if (
            editListingStep === EditListingStep.Complete &&
            onEditListingComplete
          ) {
            const data = {
              listing,
              stepData: stepData,
            }
            onEditListingComplete(data)
          }
        }, [editListingStep])

        useEffect(() => {
          if (transactionError && onEditListingError) {
            const data = {
              listing,
              stepData: stepData,
            }
            onEditListingError(transactionError, data)
          }
        }, [transactionError])

        const isListingAvailable =
          listing &&
          (listing.status === 'active' || listing.status === 'inactive') &&
          !loading

        const isListingEditable =
          listing && listing.status === 'active' && !loading && isOracleOrder

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
            {!isListingEditable && isListingAvailable && (
              <Flex
                direction="column"
                justify="center"
                css={{ px: '$4', py: '$6' }}
              >
                <Text style="h6" css={{ textAlign: 'center' }}>
                  Selected listing is not an oracle order, so cannot be edited.
                </Text>
              </Flex>
            )}
            {isListingEditable && editListingStep === EditListingStep.Edit && (
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
                    img={token?.token?.imageSmall}
                    name={listing.criteria?.data?.token?.name}
                    price={listing?.price?.amount?.decimal}
                    priceSubtitle="Price"
                    royaltiesBps={royaltyBps}
                    usdPrice={totalUsd}
                    collection={listing.criteria?.data?.collection?.name || ''}
                    currencyContract={listing.price?.currency?.contract}
                    currencyDecimals={listing?.price?.currency?.decimals}
                    currencySymbol={listing?.price?.currency?.symbol}
                    expires={expires}
                    source={(listing?.source?.icon as string) || ''}
                    quantity={listing?.quantityRemaining}
                  />
                </Box>
                <Flex direction="column" css={{ px: '$4', py: '$2' }}>
                  {quantityAvailable > 1 && (
                    <>
                      <Box css={{ mb: '$2' }}>
                        <Text
                          as="div"
                          css={{ mb: '$2' }}
                          style="subtitle2"
                          color="subtle"
                        >
                          Quantity
                        </Text>
                        <Select
                          value={`${quantity}`}
                          onValueChange={(value: string) => {
                            setQuantity(Number(value))
                          }}
                        >
                          {[...Array(quantityAvailable)].map((_a, i) => (
                            <Select.Item key={i} value={`${i + 1}`}>
                              <Select.ItemText>{i + 1}</Select.ItemText>
                            </Select.Item>
                          ))}
                        </Select>
                      </Box>
                      <Text
                        style="body3"
                        css={{ mb: 24, display: 'inline-block' }}
                      >
                        {quantityAvailable} items available
                      </Text>
                    </>
                  )}
                  <Flex css={{ mb: '$2' }} justify="between">
                    <Text style="subtitle2" color="subtle" as="p">
                      Set New Price
                    </Text>
                    <Flex css={{ alignItems: 'center', gap: 8 }}>
                      <Text style="subtitle2" color="subtle" as="p">
                        You Get
                      </Text>
                      <InfoTooltip
                        side="left"
                        width={200}
                        content={`How much ${currency?.symbol} you will receive after creator royalties are subtracted.`}
                      />
                    </Flex>
                  </Flex>
                  <Flex direction="column" css={{ gap: '$2' }}>
                    <PriceInput
                      price={price}
                      collection={collection}
                      currency={currency}
                      usdPrice={usdPrice}
                      quantity={quantity}
                      onChange={(e) => {
                        if (e.target.value === '') {
                          setPrice(undefined)
                        } else {
                          setPrice(Number(e.target.value))
                        }
                      }}
                      onBlur={() => {
                        if (price === undefined) {
                          setPrice(0)
                        }
                      }}
                    />
                    {price !== undefined &&
                      price !== null &&
                      price !== 0 &&
                      price < MINIMUM_AMOUNT && (
                        <Box>
                          <Text style="body3" color="error">
                            Amount must be higher than {MINIMUM_AMOUNT}
                          </Text>
                        </Box>
                      )}
                    {collection &&
                      collection?.floorAsk?.price?.amount?.native !==
                        undefined &&
                      price !== undefined &&
                      price !== null &&
                      price !== 0 &&
                      price >= MINIMUM_AMOUNT &&
                      currency?.contract === zeroAddress &&
                      price < collection?.floorAsk?.price.amount.native && (
                        <Box>
                          <Text style="body3" color="error">
                            Price is{' '}
                            {Math.round(
                              ((collection.floorAsk.price.amount.native -
                                price) /
                                ((collection.floorAsk.price.amount.native +
                                  price) /
                                  2)) *
                                100 *
                                1000
                            ) / 1000}
                            % below the floor
                          </Text>
                        </Box>
                      )}
                  </Flex>
                  <Box css={{ mb: '$3', mt: '$4' }}>
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
                      disabled={
                        price === undefined ||
                        price === 0 ||
                        price < MINIMUM_AMOUNT
                      }
                      onClick={editListing}
                      css={{ flex: 1 }}
                    >
                      {copy.ctaConfirm}
                    </Button>
                  </Flex>
                </Flex>
              </Flex>
            )}
            {editListingStep === EditListingStep.Approving && (
              <Flex direction="column">
                <Box css={{ p: '$4', borderBottom: '1px solid $borderColor' }}>
                  <TokenPrimitive
                    img={token?.token?.imageSmall}
                    name={token?.token?.name}
                    price={profit}
                    usdPrice={updatedTotalUsd}
                    collection={collection?.name || ''}
                    currencyContract={listing?.price?.currency?.contract}
                    currencyDecimals={listing?.price?.currency?.decimals}
                    currencySymbol={listing?.price?.currency?.symbol}
                    expires={`in ${expirationOption.text.toLowerCase()}`}
                    source={(listing?.source?.icon as string) || ''}
                    quantity={quantity}
                  />
                </Box>
                {!stepData && <Loader css={{ height: 206 }} />}
                {stepData && (
                  <>
                    <Progress
                      title={
                        stepData?.currentStepItem.txHash
                          ? 'Finalizing on blockchain'
                          : 'Approve Reservoir Oracle to update the listing'
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
            {editListingStep === EditListingStep.Complete && (
              <Flex direction="column" align="center" css={{ width: '100%' }}>
                <Flex
                  direction="column"
                  align="center"
                  css={{
                    p: '$4',
                    py: '$5',
                    textAlign: 'center',
                  }}
                >
                  <Box css={{ color: '$successAccent', mb: 24 }}>
                    <FontAwesomeIcon icon={faCheckCircle} size="3x" />
                  </Box>
                  <Text style="h5" css={{ mb: '$4' }}>
                    Listing Updated!
                  </Text>
                  <Text style="body2" color="subtle" css={{ mb: 24 }}>
                    Your listing for{' '}
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
    </EditListingModalRenderer>
  )
}

EditListingModal.Custom = EditListingModalRenderer
