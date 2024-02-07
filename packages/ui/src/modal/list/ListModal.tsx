import { styled } from '../../../stitches.config'
import React, {
  ComponentPropsWithoutRef,
  Dispatch,
  ReactElement,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import {
  Flex,
  Box,
  Text,
  Button,
  Loader,
  Select,
  ErrorWell,
  Img,
  DateInput,
  CryptoCurrencyIcon,
  Input,
} from '../../primitives'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Flatpickr from 'react-flatpickr'
import { Modal } from '../Modal'
import {
  ListingData,
  ListModalRenderer,
  ListStep,
  ListModalStepData,
} from './ListModalRenderer'
import { faCalendar, faImages, faTag } from '@fortawesome/free-solid-svg-icons'
import { useFallbackState, useReservoirClient } from '../../hooks'
import { Currency } from '../../types/Currency'
import SigninStep from '../SigninStep'
import { WalletClient, formatUnits, zeroAddress } from 'viem'
import ListCheckout from './ListCheckout'
import QuantitySelector from '../QuantitySelector'
import dayjs from 'dayjs'
import { CurrencySelector } from '../CurrencySelector'
import PriceBreakdown from './PriceBreakdown'
import FloorDropdown from './FloorDropdown'
import { ReservoirWallet } from '@reservoir0x/reservoir-sdk'
import { formatNumber } from '../../lib/numbers'
import { Dialog } from '../../primitives/Dialog'

type ListingCallbackData = {
  listings?: ListingData[]
  tokenId?: string
  collectionId?: string
}

const ModalCopy = {
  title: 'List Item for sale',
  ctaClose: 'Close',
  ctaSetPrice: 'Set your price',
  ctaList: 'List for Sale',
  ctaAwaitingApproval: 'Waiting for Approval',
  ctaGoToToken: 'Go to Token',
}

type Props = Pick<Parameters<typeof Modal>['0'], 'trigger'> & {
  openState?: [boolean, Dispatch<SetStateAction<boolean>>]
  tokenId?: string
  collectionId?: string
  chainId?: number
  orderKind?: ListingData['listing']['orderKind']
  currencies?: Currency[]
  normalizeRoyalties?: boolean
  enableOnChainRoyalties?: boolean
  oracleEnabled?: boolean
  copyOverrides?: Partial<typeof ModalCopy>
  feesBps?: string[]
  walletClient?: ReservoirWallet | WalletClient
  onGoToToken?: () => any
  onListingComplete?: (data: ListingCallbackData) => void
  onListingError?: (error: Error, data: ListingCallbackData) => void
  onClose?: (
    data: ListingCallbackData,
    stepData: ListModalStepData | null,
    currentStep: ListStep
  ) => void
  onPointerDownOutside?: ComponentPropsWithoutRef<
    typeof Dialog
  >['onPointerDownOutside']
}

const Image = styled('img', {})

const MINIMUM_AMOUNT = 0.000001
const MAXIMUM_AMOUNT = Infinity

export function ListModal({
  openState,
  trigger,
  tokenId,
  collectionId,
  chainId,
  orderKind,
  currencies,
  normalizeRoyalties,
  enableOnChainRoyalties = false,
  oracleEnabled = false,
  copyOverrides,
  feesBps,
  walletClient,
  onGoToToken,
  onListingComplete,
  onListingError,
  onClose,
  onPointerDownOutside,
}: Props): ReactElement {
  const copy: typeof ModalCopy = { ...ModalCopy, ...copyOverrides }
  const [open, setOpen] = useFallbackState(
    openState ? openState[0] : false,
    openState
  )

  const datetimeElement = useRef<Flatpickr | null>(null)

  const client = useReservoirClient()

  const currentChain = client?.currentChain()

  const modalChain = chainId
    ? client?.chains.find(({ id }) => id === chainId) || currentChain
    : currentChain

  return (
    <ListModalRenderer
      open={open}
      orderKind={orderKind}
      chainId={modalChain?.id}
      tokenId={tokenId}
      collectionId={collectionId}
      currencies={currencies}
      normalizeRoyalties={normalizeRoyalties}
      enableOnChainRoyalties={enableOnChainRoyalties}
      oracleEnabled={oracleEnabled}
      feesBps={feesBps}
      walletClient={walletClient}
    >
      {({
        loading,
        token,
        quantityAvailable,
        collection,
        usdPrice,
        listStep,
        marketplace,
        exchange,
        expirationOption,
        expirationOptions,
        isFetchingOnChainRoyalties,
        listingData,
        transactionError,
        stepData,
        price,
        currencies,
        currency,
        quantity,
        setPrice,
        listToken,
        setCurrency,
        setExpirationOption,
        setQuantity,
      }) => {
        const source = client?.source ? client?.source : marketplace?.domain

        const minimumDate = useMemo(() => {
          return dayjs().add(1, 'h').format('MM/DD/YYYY h:mm A')
        }, [open])

        const expirationDate = useMemo(() => {
          if (expirationOption && expirationOption.relativeTime) {
            const newExpirationTime = expirationOption.relativeTimeUnit
              ? dayjs().add(
                  expirationOption.relativeTime,
                  expirationOption.relativeTimeUnit
                )
              : dayjs.unix(expirationOption.relativeTime)
            return newExpirationTime.format('MM/DD/YYYY h:mm A')
          }
          return ''
        }, [expirationOption])

        useEffect(() => {
          if (listStep === ListStep.Complete && onListingComplete) {
            const data: ListingCallbackData = {
              tokenId: tokenId,
              collectionId: collectionId,
              listings: listingData,
            }
            onListingComplete(data)
          }
        }, [listStep])

        useEffect(() => {
          if (transactionError && onListingError) {
            const data: ListingCallbackData = {
              tokenId: tokenId,
              collectionId: collectionId,
              listings: listingData,
            }
            onListingError(transactionError, data)
          }
        }, [transactionError])

        const floorAskPrice = collection?.floorAsk?.price
        const decimalFloorPrice = collection?.floorAsk?.price?.amount?.decimal
        const nativeFloorPrice = collection?.floorAsk?.price?.amount?.native
        const usdFloorPrice = collection?.floorAsk?.price?.amount?.usd
        const defaultCurrency = currencies?.find(
          (currency) => currency?.contract === zeroAddress
        )

        const floorButtonEnabled =
          (currency.contract === floorAskPrice?.currency?.contract &&
            decimalFloorPrice) ||
          (currency.symbol === 'USDC' && usdFloorPrice) ||
          (nativeFloorPrice && currency.contract === zeroAddress) ||
          (nativeFloorPrice && defaultCurrency)
        const minimumAmount = exchange?.minPriceRaw
          ? Number(
              formatUnits(
                BigInt(exchange.minPriceRaw),
                currency?.decimals || 18
              )
            )
          : MINIMUM_AMOUNT
        const maximumAmount = exchange?.maxPriceRaw
          ? Number(
              formatUnits(
                BigInt(exchange.maxPriceRaw),
                currency?.decimals || 18
              )
            )
          : MAXIMUM_AMOUNT

        const withinPricingBounds =
          price &&
          Number(price) !== 0 &&
          Number(price) <= maximumAmount &&
          Number(price) >= minimumAmount

        const canPurchase = price !== '' && withinPricingBounds

        const handleSetFloor = () => {
          // If currency matches floor ask currency, use decimal floor price
          if (
            currency.contract === floorAskPrice?.currency?.contract &&
            decimalFloorPrice
          ) {
            setPrice(decimalFloorPrice.toString())
          }

          // If currency is USDC, use usd floor price
          else if (currency.symbol === 'USDC' && usdFloorPrice) {
            setPrice(usdFloorPrice?.toString())
          } else if (nativeFloorPrice) {
            // If currency is native currency, use native floor price
            if (currency.contract === zeroAddress) {
              setPrice(nativeFloorPrice.toString())
            }
            // Fallback to default currency if it exists
            else {
              if (defaultCurrency) {
                setCurrency(defaultCurrency)
                setPrice(nativeFloorPrice.toString())
              }
            }
          }
        }

        return (
          <Modal
            trigger={trigger}
            title={copy.title}
            open={open}
            onOpenChange={(open) => {
              if (!open && onClose) {
                const data: ListingCallbackData = {
                  tokenId: tokenId,
                  collectionId: collectionId,
                  listings: listingData,
                }
                onClose(data, stepData, listStep)
              }

              setOpen(open)
            }}
            loading={loading}
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
              if (onPointerDownOutside) {
                onPointerDownOutside(e)
              }
            }}
            onFocusCapture={(e) => {
              e.stopPropagation()
            }}
          >
            {!loading && listStep == ListStep.Unavailable && (
              <Flex
                direction="column"
                align="center"
                css={{ p: '$4', gap: '$5' }}
              >
                <Box css={{ color: '$neutralSolid', mt: 48 }}>
                  <FontAwesomeIcon
                    icon={faTag}
                    style={{ width: '32px', height: '32px' }}
                  />
                </Box>

                <Text style="h6" css={{ mb: '$3', textAlign: 'center' }}>
                  Listing is not available for this collection.
                </Text>
                <Button
                  css={{ width: '100%' }}
                  onClick={() => {
                    setOpen(false)
                  }}
                >
                  {copy.ctaClose}
                </Button>
              </Flex>
            )}
            {!loading && listStep == ListStep.SetPrice && (
              <Flex direction="column">
                {transactionError && <ErrorWell error={transactionError} />}
                <ListCheckout
                  collection={collection}
                  token={token}
                  chain={modalChain}
                />
                <Flex
                  direction="column"
                  align="center"
                  css={{ width: '100%', p: '$4', gap: 24 }}
                >
                  {quantityAvailable > 1 && (
                    <Flex
                      align="center"
                      justify="between"
                      css={{ width: '100%', gap: '$3', '@bp1': { gap: '$6' } }}
                    >
                      <Flex
                        align="start"
                        direction="column"
                        css={{ gap: '$1', flexShrink: 0 }}
                      >
                        <Text style="subtitle2">Quantity</Text>
                        <Text style="body3" color="subtle">
                          {quantityAvailable} items available
                        </Text>
                      </Flex>
                      <QuantitySelector
                        quantity={quantity}
                        setQuantity={setQuantity}
                        min={1}
                        max={quantityAvailable}
                        css={{ width: '100%', justifyContent: 'space-between' }}
                      />
                    </Flex>
                  )}

                  <Flex direction="column" css={{ gap: '$2', width: '100%' }}>
                    <Text style="subtitle2">Enter a price</Text>
                    <Flex align="center" justify="between" css={{ gap: '$2' }}>
                      <Input
                        type="number"
                        value={price}
                        onChange={(e) => {
                          setPrice(e.target.value)
                        }}
                        placeholder="Amount"
                        css={{ width: '100%' }}
                        containerCss={{ width: '100%', height: 44 }}
                      />
                      {currencies.length > 1 ? (
                        <CurrencySelector
                          chainId={chainId}
                          currency={currency}
                          currencies={currencies}
                          setCurrency={setCurrency}
                          triggerCss={{
                            backgroundColor: '$neutralBgHover',
                            borderRadius: 8,
                            p: '$3',
                            width: 120,
                            flexShrink: 0,
                            height: 44,
                          }}
                          valueCss={{
                            justifyContent: 'space-between',
                            width: '100%',
                          }}
                        />
                      ) : (
                        <Flex align="center" css={{ flexShrink: 0, px: '$2' }}>
                          <Box
                            css={{
                              width: 'auto',
                              height: 20,
                            }}
                          >
                            <CryptoCurrencyIcon
                              chainId={chainId}
                              css={{ height: 18 }}
                              address={currency.contract}
                            />
                          </Box>
                          <Text
                            style="body1"
                            color="subtle"
                            css={{ ml: '$1' }}
                            as="p"
                          >
                            {currency.symbol}
                          </Text>
                        </Flex>
                      )}
                      {floorButtonEnabled ? (
                        <Button
                          color="secondary"
                          size="none"
                          css={{
                            height: 44,
                            px: '$4',
                            borderRadius: 8,
                            fontWeight: 500,
                          }}
                          onClick={() => handleSetFloor()}
                        >
                          Floor
                        </Button>
                      ) : null}
                      <FloorDropdown
                        token={token}
                        currency={currency}
                        defaultCurrency={defaultCurrency}
                        setPrice={setPrice}
                        setCurrency={setCurrency}
                      />
                    </Flex>
                    {Number(price) !== 0 && !withinPricingBounds && (
                      <Box>
                        <Text style="body2" color="error">
                          {maximumAmount !== Infinity
                            ? `Amount must be between ${formatNumber(
                                minimumAmount
                              )} - ${formatNumber(maximumAmount)}`
                            : `Amount must be higher than ${formatNumber(
                                minimumAmount
                              )}`}
                        </Text>
                      </Box>
                    )}
                    {collection &&
                      collection?.floorAsk?.price?.amount?.native !==
                        undefined &&
                      Number(price) !== 0 &&
                      Number(price) >= minimumAmount &&
                      currency.contract === zeroAddress &&
                      Number(price) <
                        collection?.floorAsk?.price.amount.native && (
                        <Box>
                          <Text style="body2" color="error">
                            Price is{' '}
                            {Math.round(
                              ((collection.floorAsk.price.amount.native -
                                +price) /
                                ((collection.floorAsk.price.amount.native +
                                  +price) /
                                  2)) *
                                100 *
                                1000
                            ) / 1000}
                            % below the floor
                          </Text>
                        </Box>
                      )}
                  </Flex>
                  <Flex direction="column" css={{ width: '100%', gap: '$2' }}>
                    <Text style="subtitle2">Expiration Date</Text>
                    <Flex align="center" css={{ gap: '$2' }}>
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
                        css={{ borderRadius: 8, maxWidth: 160, height: 44 }}
                      >
                        {expirationOptions
                          .filter(({ value }) => value !== 'custom')
                          .map((option) => (
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
                          chainId: modalChain?.id,
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
                                relativeTime: e[0] / 1000,
                              })
                            }
                          }
                        }}
                        containerCss={{
                          height: 44,
                          width: 46,
                          '@bp1': {
                            flex: 1,
                            width: '100%',
                          },
                        }}
                        css={{
                          padding: 0,
                          '@bp1': {
                            padding: '12px 16px 12px 48px',
                          },
                        }}
                      />
                    </Flex>
                  </Flex>
                  <PriceBreakdown
                    price={price}
                    usdPrice={usdPrice}
                    currency={currency}
                    quantity={quantity}
                    collection={collection}
                    marketplace={marketplace}
                  />
                </Flex>
                <Box css={{ p: '$4', width: '100%' }}>
                  <Button
                    disabled={canPurchase ? false : true}
                    onClick={() => listToken}
                    css={{ width: '100%' }}
                  >
                    {copy.ctaList}
                  </Button>
                </Box>
              </Flex>
            )}
            {!loading && listStep == ListStep.Listing && (
              <Flex direction="column">
                <ListCheckout
                  collection={collection}
                  token={token}
                  price={price}
                  currency={currency}
                  quantity={quantity}
                  expirationOption={expirationOption}
                  containerCss={{
                    borderBottom: '1px solid',
                    borderBottomColor: '$neutralLine',
                    borderColor: '$neutralLine',
                  }}
                />
                <Flex
                  direction="column"
                  align="center"
                  css={{ width: '100%', p: 24, gap: '$4' }}
                >
                  {stepData && stepData.currentStep.id === 'auth' ? (
                    <SigninStep css={{ mt: 48, mb: '$4', gap: 20 }} />
                  ) : null}
                  {stepData && stepData.currentStep.id !== 'auth' ? (
                    <>
                      <Text css={{ textAlign: 'center' }} style="h6">
                        {stepData.currentStep.kind === 'transaction'
                          ? 'Approve Collections'
                          : 'Confirm listing in your wallet'}
                      </Text>
                      <Text
                        css={{
                          textAlign: 'center',
                          maxWidth: 395,
                          mx: 'auto',
                        }}
                        style="body1"
                        color="subtle"
                      >
                        {stepData?.currentStep.description}
                      </Text>
                      <Flex css={{ color: '$neutralSolid' }}>
                        <FontAwesomeIcon
                          icon={
                            stepData.currentStep.kind === 'transaction'
                              ? faImages
                              : faTag
                          }
                          size="2x"
                        />
                      </Flex>
                    </>
                  ) : null}
                  {!stepData && (
                    <Flex
                      css={{ height: '100%', py: '$5' }}
                      justify="center"
                      align="center"
                    >
                      <Loader />
                    </Flex>
                  )}
                </Flex>
                <Flex css={{ width: '100%', p: '$4' }}>
                  <Button css={{ width: '100%', mt: 'auto' }} disabled={true}>
                    <Loader />
                    {copy.ctaAwaitingApproval}
                  </Button>
                </Flex>
              </Flex>
            )}
            {!loading && listStep == ListStep.Complete && (
              <Flex direction="column" align="center">
                <Flex
                  direction="column"
                  align="center"
                  css={{ width: '100%', px: '$5', pt: '$5', gap: 24 }}
                >
                  <Flex
                    direction="column"
                    align="center"
                    css={{ width: '100%', gap: '$2', overflow: 'hidden' }}
                  >
                    <Img
                      src={token?.token?.image || collection?.image}
                      alt={token?.token?.name || token?.token?.tokenId}
                      css={{
                        width: 120,
                        height: 120,
                        aspectRatio: '1/1',
                        borderRadius: 4,
                      }}
                    />
                    <Text style="h6" ellipsify>
                      {token?.token?.tokenId
                        ? `#${token?.token?.tokenId}`
                        : token?.token?.name}
                    </Text>
                    <Text style="subtitle2" color="accent" ellipsify>
                      {collection?.name}
                    </Text>
                  </Flex>
                  <Text style="h5" as="h5">
                    Your item has been listed!
                  </Text>

                  {source ? (
                    <Flex direction="column" align="center" css={{ gap: '$2' }}>
                      <Text style="subtitle3" color="subtle" as="p">
                        View Listing on
                      </Text>
                      <a
                        target="_blank"
                        href={`${modalChain?.baseApiUrl}/redirect/sources/${source}/tokens/${token?.token?.contract}:${token?.token?.tokenId}/link/v2`}
                      >
                        <Image
                          css={{ width: 24, borderRadius: 4 }}
                          src={marketplace?.imageUrl}
                        />
                      </a>
                    </Flex>
                  ) : null}
                </Flex>
                <Flex
                  css={{
                    p: '$4',
                    width: '100%',
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
                        }}
                        css={{ flex: 1 }}
                        color="secondary"
                      >
                        {copy.ctaClose}
                      </Button>
                      <Button
                        style={{ flex: 1 }}
                        color="primary"
                        onClick={() => {
                          onGoToToken()
                        }}
                      >
                        {copy.ctaGoToToken}
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => {
                        setOpen(false)
                      }}
                      style={{ flex: 1 }}
                      color="primary"
                    >
                      {copy.ctaClose}
                    </Button>
                  )}
                </Flex>
              </Flex>
            )}
          </Modal>
        )
      }}
    </ListModalRenderer>
  )
}

ListModal.Custom = ListModalRenderer
