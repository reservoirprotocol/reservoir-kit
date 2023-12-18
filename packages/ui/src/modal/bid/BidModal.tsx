import React, {
  ReactElement,
  useEffect,
  useState,
  useRef,
  Dispatch,
  SetStateAction,
  useContext,
  ComponentPropsWithoutRef,
} from 'react'
import {
  Flex,
  Text,
  FormatWrappedCurrency,
  Box,
  Input,
  Select,
  DateInput,
  Button,
  ErrorWell,
  Loader,
  FormatCurrency,
  FormatCryptoCurrency,
  CryptoCurrencyIcon,
} from '../../primitives'
import { Modal } from '../Modal'
import {
  BidModalRenderer,
  BidStep,
  BidData,
  Trait,
  BidModalStepData,
} from './BidModalRenderer'
import TokenInfo from './TokenInfo'
import dayjs from 'dayjs'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCalendar,
  faClose,
  faCheckCircle,
  faHand,
} from '@fortawesome/free-solid-svg-icons'
import Flatpickr from 'react-flatpickr'
import TransactionProgress from '../TransactionProgress'
import getLocalMarketplaceData from '../../lib/getLocalMarketplaceData'
import AttributeSelector from './AttributeSelector'
import Popover from '../../primitives/Popover'
import PseudoInput from '../../primitives/PseudoInput'
import { useFallbackState, useReservoirClient } from '../../hooks'
import { Currency } from '../../types/Currency'
import { CurrencySelector } from '../CurrencySelector'
import { ProviderOptionsContext } from '../../ReservoirKitProvider'
import QuantitySelector from '../QuantitySelector'
import { ReservoirWallet } from '@reservoir0x/reservoir-sdk'
import { WalletClient, formatUnits, zeroAddress } from 'viem'
import { formatNumber } from '../../lib/numbers'
import { Dialog } from '../../primitives/Dialog'

type BidCallbackData = {
  tokenId?: string
  collectionId?: string
  bidData: BidData | null
}

const ModalCopy = {
  titleSetPrice: 'Make an Offer',
  titleConfirm: 'Complete Offer',
  titleComplete: 'Offer Submitted',
  ctaBidDisabled: 'Enter a Price',
  ctaBid: '',
  ctaConvertManually: 'Convert Manually',
  ctaConvertAutomatically: '',
  ctaAwaitingApproval: 'Waiting for Approval',
  ctaEditOffer: 'Edit Offer',
  ctaRetry: 'Retry',
  ctaViewOffers: 'View Offers',
  ctaClose: 'Close',
}

type Props = Pick<Parameters<typeof Modal>['0'], 'trigger'> & {
  openState?: [boolean, Dispatch<SetStateAction<boolean>>]
  tokenId?: string
  orderKind?: BidData['orderKind']
  chainId?: number
  collectionId?: string
  attribute?: Trait
  normalizeRoyalties?: boolean
  currencies?: Currency[]
  oracleEnabled?: boolean
  copyOverrides?: Partial<typeof ModalCopy>
  feesBps?: string[] | null
  walletClient?: ReservoirWallet | WalletClient
  usePermit?: boolean
  onViewOffers?: () => void
  onClose?: (
    data: BidCallbackData,
    stepData: BidModalStepData | null,
    currentStep: BidStep
  ) => void
  onBidComplete?: (data: any) => void
  onBidError?: (error: Error, data: any) => void
  onPointerDownOutside?: ComponentPropsWithoutRef<
    typeof Dialog
  >['onPointerDownOutside']
}

function titleForStep(step: BidStep, copy: typeof ModalCopy) {
  switch (step) {
    case BidStep.SetPrice:
    case BidStep.Unavailable:
      return copy.titleSetPrice
    case BidStep.Offering:
      return copy.titleConfirm
    case BidStep.Complete:
      return copy.titleComplete
  }
}

const MINIMUM_DATE = dayjs().add(1, 'h').format('MM/DD/YYYY h:mm A')
const MINIMUM_AMOUNT = 0.000001
const MAXIMUM_AMOUNT = Infinity

export function BidModal({
  openState,
  trigger,
  tokenId,
  chainId,
  collectionId,
  attribute,
  normalizeRoyalties,
  currencies,
  oracleEnabled = false,
  copyOverrides,
  feesBps,
  orderKind,
  walletClient,
  usePermit,
  onViewOffers,
  onClose,
  onBidComplete,
  onBidError,
  onPointerDownOutside,
}: Props): ReactElement {
  const copy: typeof ModalCopy = { ...ModalCopy, ...copyOverrides }
  const [open, setOpen] = useFallbackState(
    openState ? openState[0] : false,
    openState
  )

  const client = useReservoirClient()

  const currentChain = client?.currentChain()

  const modalChain = chainId
    ? client?.chains.find(({ id }) => id === chainId) || currentChain
    : currentChain

  const datetimeElement = useRef<Flatpickr | null>(null)
  const [stepTitle, setStepTitle] = useState('')
  const [localMarketplace, setLocalMarketplace] = useState<ReturnType<
    typeof getLocalMarketplaceData
  > | null>(null)
  const [attributesSelectable, setAttributesSelectable] = useState(false)

  useEffect(() => {
    setLocalMarketplace(getLocalMarketplaceData())
  }, [])
  const [attributeSelectorOpen, setAttributeSelectorOpen] = useState(false)

  return (
    <BidModalRenderer
      open={open}
      orderKind={orderKind}
      chainId={modalChain?.id}
      tokenId={tokenId}
      collectionId={collectionId}
      attribute={attribute}
      normalizeRoyalties={normalizeRoyalties}
      oracleEnabled={oracleEnabled}
      currencies={currencies}
      feesBps={feesBps}
      walletClient={walletClient}
      usePermit={usePermit}
    >
      {({
        token,
        collection,
        attributes,
        bidStep,
        expirationOption,
        expirationOptions,
        wrappedBalance,
        wrappedContractName,
        wrappedContractAddress,
        bidAmountPerUnit,
        totalBidAmount,
        totalBidAmountUsd,
        quantity,
        setQuantity,
        hasEnoughNativeCurrency,
        hasEnoughWrappedCurrency,
        loading,
        traitBidSupported,
        collectionBidSupported,
        partialBidSupported,
        amountToWrap,
        balance,
        convertLink,
        canAutomaticallyConvert,
        transactionError,
        stepData,
        bidData,
        currencies,
        currency,
        exchange,
        setCurrency,
        setBidAmountPerUnit,
        setExpirationOption,
        setBidStep,
        setTrait,
        trait,
        placeBid,
      }) => {
        const [expirationDate, setExpirationDate] = useState('')

        const tokenCount = collection?.tokenCount
          ? +collection.tokenCount
          : undefined

        const itemImage =
          token && token.token?.imageSmall
            ? token.token?.imageSmall
            : (collection?.image as string)

        const providerOptionsContext = useContext(ProviderOptionsContext)

        const quantityEnabled =
          partialBidSupported &&
          (!tokenId ||
            (token?.token?.kind === 'erc1155' &&
              Number(token?.token?.supply) > 1))

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
            setExpirationDate(newExpirationTime.format('MM/DD/YYYY h:mm A'))
          } else {
            setExpirationDate('')
          }
        }, [expirationOption])

        useEffect(() => {
          if (bidStep === BidStep.Complete && onBidComplete) {
            const data: BidCallbackData = {
              tokenId: tokenId,
              collectionId: collectionId,
              bidData,
            }
            onBidComplete(data)
          }
        }, [bidStep])

        useEffect(() => {
          if (transactionError && onBidError) {
            const data: BidCallbackData = {
              tokenId: tokenId,
              collectionId: collectionId,
              bidData,
            }
            onBidError(transactionError, data)
          }
        }, [transactionError])

        useEffect(() => {
          if (open && attributes && !tokenId && attribute) {
            setTrait(attribute)
          } else {
            setTrait(undefined)
          }

          if (open && attributes && !tokenId) {
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

        const ctaButtonText =
          copy.ctaBid.length > 0
            ? copy.ctaBid
            : token && token.token
            ? 'Make an Offer'
            : trait
            ? 'Make an Attribute Offer'
            : 'Make a Collection Offer'

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
          totalBidAmount !== 0 &&
          totalBidAmount <= maximumAmount &&
          totalBidAmount >= minimumAmount

        const canPurchase = bidAmountPerUnit !== '' && withinPricingBounds

        const topBidPrice =
          token?.market?.topBid?.price ?? collection?.topBid?.price
        const decimalTopBidPrice = topBidPrice?.amount?.decimal
        const nativeTopBidPrice = topBidPrice?.amount?.native
        const usdTopBidPrice = topBidPrice?.amount?.usd
        const defaultCurrency = currencies?.find(
          (currency) => currency?.contract === zeroAddress
        )

        const topOfferButtonEnabled =
          (currency?.contract?.toLowerCase() ===
            topBidPrice?.currency?.contract?.toLowerCase() &&
            decimalTopBidPrice) ||
          (currency.symbol === 'USDC' && usdTopBidPrice) ||
          (nativeTopBidPrice && currency.contract === zeroAddress) ||
          (nativeTopBidPrice && defaultCurrency)

        const handleSetBestOffer = () => {
          // If currency matches top bid currency, use decimal floor price
          if (
            currency.contract?.toLowerCase() ===
              topBidPrice?.currency?.contract?.toLowerCase() &&
            decimalTopBidPrice
          ) {
            setBidAmountPerUnit(decimalTopBidPrice.toString())
          }

          // If currency is USDC, use usd floor price
          else if (currency.symbol === 'USDC' && usdTopBidPrice) {
            setBidAmountPerUnit(usdTopBidPrice?.toString())
          } else if (nativeTopBidPrice) {
            // If currency is native currency, use native floor price
            if (currency.contract === zeroAddress) {
              setBidAmountPerUnit(nativeTopBidPrice.toString())
            }
            // Fallback to default currency if it exists
            else {
              if (defaultCurrency) {
                setCurrency(defaultCurrency)
                setBidAmountPerUnit(nativeTopBidPrice.toString())
              }
            }
          }
        }

        return (
          <Modal
            trigger={trigger}
            title={titleForStep(bidStep, copy)}
            open={open}
            onOpenChange={(open) => {
              if (!open && onClose) {
                const data: BidCallbackData = {
                  tokenId: tokenId,
                  collectionId: collectionId,
                  bidData,
                }
                onClose(data, stepData, bidStep)
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
            {bidStep === BidStep.SetPrice && !loading && collection && (
              <Flex direction="column">
                <TokenInfo
                  chain={modalChain}
                  token={token ? token : undefined}
                  collection={collection}
                  containerCss={{
                    borderBottom: '1px solid',
                    borderBottomColor: '$neutralLine',
                    borderColor: '$neutralLine',
                  }}
                />
                <Flex
                  justify="between"
                  direction="column"
                  align="center"
                  css={{ width: '100%', p: '$4', gap: 24, overflow: 'hidden' }}
                >
                  <Flex direction="column" css={{ gap: '$2', width: '100%' }}>
                    <Flex justify="between" css={{ gap: '$3' }}>
                      <Text style="subtitle2">Offer Price</Text>
                      <Text
                        as={Flex}
                        css={{ gap: '$1' }}
                        align="center"
                        style="subtitle3"
                      >
                        Balance:{' '}
                        <FormatWrappedCurrency
                          chainId={modalChain?.id}
                          logoWidth={10}
                          textStyle="tiny"
                          amount={wrappedBalance?.value}
                          address={wrappedContractAddress}
                          decimals={wrappedBalance?.decimals}
                          symbol={wrappedBalance?.symbol}
                        />{' '}
                      </Text>
                    </Flex>

                    <Flex css={{ mt: '$2', gap: quantityEnabled ? '$2' : 20 }}>
                      <Text
                        as={Flex}
                        css={{ gap: '$2', flexShrink: 0 }}
                        align="center"
                        style="body1"
                        color="subtle"
                      >
                        {currencies.length > 1 ? (
                          <CurrencySelector
                            chainId={modalChain?.id}
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
                          />
                        ) : (
                          <>
                            <CryptoCurrencyIcon
                              chainId={modalChain?.id}
                              css={{ height: 20 }}
                              address={wrappedContractAddress}
                            />
                            {wrappedContractName}
                          </>
                        )}
                      </Text>
                      <Input
                        type="number"
                        value={bidAmountPerUnit}
                        onChange={(e) => {
                          setBidAmountPerUnit(e.target.value)
                        }}
                        placeholder="Enter price"
                        containerCss={{
                          width: '100%',
                        }}
                        css={{
                          textAlign: 'center',
                          '@bp1': {
                            textAlign: 'left',
                          },
                        }}
                      />
                      {topOfferButtonEnabled ? (
                        <Button
                          color="secondary"
                          size="none"
                          css={{
                            height: 44,
                            px: '$4',
                            borderRadius: 8,
                            fontWeight: 500,
                            flexShrink: 0,
                          }}
                          onClick={handleSetBestOffer}
                        >
                          Best Offer
                        </Button>
                      ) : null}
                    </Flex>

                    {totalBidAmount !== 0 && !withinPricingBounds && (
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

                    {attributes &&
                      attributes.length > 0 &&
                      (attributesSelectable || trait) &&
                      !tokenId &&
                      traitBidSupported && (
                        <>
                          <Popover.Root
                            open={attributeSelectorOpen}
                            onOpenChange={
                              attributesSelectable
                                ? setAttributeSelectorOpen
                                : undefined
                            }
                          >
                            <Popover.Trigger asChild>
                              {trait ? (
                                <PseudoInput css={{ py: '$3' }}>
                                  <Flex
                                    justify="between"
                                    css={{
                                      gap: '$2',
                                      alignItems: 'center',
                                      color: '$neutralText',
                                    }}
                                  >
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
                                            textStyle="body1"
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
                                  </Flex>
                                </PseudoInput>
                              ) : (
                                <Button
                                  color="ghost"
                                  css={{
                                    color: '$accentText',
                                    fontWeight: 500,
                                    fontSize: 14,
                                    maxWidth: 'max-content',
                                  }}
                                  size="none"
                                >
                                  + Add Attribute
                                </Button>
                              )}
                            </Popover.Trigger>
                            <Popover.Content
                              side="bottom"
                              align="start"
                              sideOffset={-20}
                              style={{ maxWidth: '100vw' }}
                            >
                              <AttributeSelector
                                attributes={attributes}
                                tokenCount={tokenCount}
                                setTrait={setTrait}
                                setOpen={setAttributeSelectorOpen}
                              />
                            </Popover.Content>
                          </Popover.Root>
                        </>
                      )}
                  </Flex>

                  {quantityEnabled ? (
                    <Flex
                      justify="between"
                      align="center"
                      css={{ gap: '$5', width: '100%' }}
                    >
                      <Flex
                        direction="column"
                        align="start"
                        css={{ gap: '$2', flexShrink: 0 }}
                      >
                        <Text style="subtitle2">Quantity</Text>
                        <Text
                          color="subtle"
                          style="body3"
                          css={{
                            display: 'none',
                            '@bp1': {
                              display: 'block',
                            },
                          }}
                        >
                          Offers can be accepted separately
                        </Text>
                      </Flex>
                      <QuantitySelector
                        quantity={quantity}
                        setQuantity={setQuantity}
                        min={1}
                        max={999999}
                        css={{ justifyContent: 'space-between', width: '100%' }}
                      />
                    </Flex>
                  ) : null}

                  <Flex direction="column" css={{ gap: '$2', width: '100%' }}>
                    <Text as={Box} style="subtitle2">
                      Expiration Date
                    </Text>
                    <Flex css={{ gap: '$2' }}>
                      <Select
                        css={{
                          flex: 1,
                          '@bp1': {
                            width: 160,
                            flexDirection: 'row',
                          },
                        }}
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
                          minDate: MINIMUM_DATE,
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

                  <Flex
                    justify="between"
                    align="center"
                    css={{ gap: '$4', width: '100%' }}
                  >
                    <Text style="h6">Total Offer Price</Text>
                    <Flex direction="column" align="end">
                      <FormatWrappedCurrency
                        chainId={modalChain?.id}
                        logoWidth={16}
                        textStyle="h6"
                        amount={totalBidAmount}
                        address={currency?.contract}
                        decimals={currency?.decimals}
                        symbol={currency?.symbol}
                      />
                      <FormatCurrency
                        style="subtitle3"
                        color="subtle"
                        amount={totalBidAmountUsd}
                      />
                    </Flex>
                  </Flex>
                  <Box css={{ width: '100%', mt: 'auto' }}>
                    {oracleEnabled && (
                      <Text
                        style="body2"
                        color="subtle"
                        css={{
                          mb: 10,
                          textAlign: 'center',
                          width: '100%',
                          display: 'block',
                        }}
                      >
                        You can change or cancel your offer for free on{' '}
                        {localMarketplace?.title}.
                      </Text>
                    )}
                    {!canPurchase && (
                      <Button disabled={true} css={{ width: '100%' }}>
                        {copy.ctaBidDisabled}
                      </Button>
                    )}
                    {canPurchase && hasEnoughWrappedCurrency && (
                      <Button
                        onClick={() => placeBid()}
                        css={{ width: '100%' }}
                      >
                        {ctaButtonText}
                      </Button>
                    )}
                    {canPurchase && !hasEnoughWrappedCurrency && (
                      <>
                        {!hasEnoughNativeCurrency && (
                          <Flex css={{ gap: '$2', mt: 10 }} justify="center">
                            <Text style="body3" color="error">
                              {balance?.symbol || 'ETH'} Balance
                            </Text>
                            <FormatCryptoCurrency
                              chainId={modalChain?.id}
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
                            disabled={providerOptionsContext.disableJumperLink}
                            css={{ flex: '1 0 auto' }}
                            color="secondary"
                            onClick={() => {
                              window.open(convertLink, '_blank')
                            }}
                          >
                            {providerOptionsContext.disableJumperLink
                              ? ctaButtonText
                              : copy.ctaConvertManually}
                          </Button>
                          {canAutomaticallyConvert && (
                            <Button
                              css={{ flex: 1, maxHeight: 44 }}
                              disabled={!hasEnoughNativeCurrency}
                              onClick={() => placeBid()}
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
                      </>
                    )}
                  </Box>
                </Flex>
              </Flex>
            )}

            {bidStep === BidStep.Offering && collection && (
              <Flex direction="column">
                <TokenInfo
                  chain={modalChain}
                  token={token ? token : undefined}
                  collection={collection}
                  price={totalBidAmount}
                  currency={currency}
                  quantity={quantity}
                  trait={trait}
                  expirationOption={expirationOption}
                  containerCss={{
                    borderBottom: '1px solid',
                    borderBottomColor: '$neutralLine',
                    borderColor: '$neutralLine',
                  }}
                />
                <Flex
                  justify="between"
                  direction="column"
                  align="center"
                  css={{ width: '100%', p: '$4', gap: 24 }}
                >
                  {transactionError && (
                    <ErrorWell
                      error={transactionError}
                      css={{ width: '100%' }}
                    />
                  )}
                  {stepData && (
                    <>
                      <Text css={{ textAlign: 'center' }} style="subtitle1">
                        {stepTitle}
                      </Text>
                      {stepData.currentStep.kind === 'signature' && (
                        <TransactionProgress
                          justify="center"
                          fromImg={itemImage || ''}
                          toImgs={[localMarketplace?.icon || '']}
                        />
                      )}
                      {stepData.currentStep.kind !== 'signature' && (
                        <Flex align="center" justify="center">
                          <Flex
                            css={{
                              background: '$neutralLine',
                              borderRadius: 8,
                            }}
                          >
                            <CryptoCurrencyIcon
                              chainId={modalChain?.id}
                              css={{ height: 56, width: 56 }}
                              address={wrappedContractAddress}
                            />
                          </Flex>
                        </Flex>
                      )}
                      <Text
                        css={{
                          textAlign: 'center',
                          mt: 24,
                          maxWidth: 395,
                          mx: 'auto',
                          mb: '$4',
                        }}
                        style="body2"
                        color="subtle"
                      >
                        {stepData?.currentStep.description}
                      </Text>
                    </>
                  )}
                  {!stepData && (
                    <Flex
                      css={{ height: '100%', py: '$5' }}
                      justify="center"
                      align="center"
                    >
                      <Loader />
                    </Flex>
                  )}
                  {!transactionError && (
                    <Button css={{ width: '100%', mt: 'auto' }} disabled={true}>
                      <Loader />
                      {copy.ctaAwaitingApproval}
                    </Button>
                  )}
                  {transactionError && (
                    <Flex css={{ mt: 'auto', gap: 10, width: '100%' }}>
                      <Button
                        color="secondary"
                        css={{ flex: 1 }}
                        onClick={() => setBidStep(BidStep.SetPrice)}
                      >
                        {copy.ctaEditOffer}
                      </Button>
                      <Button css={{ flex: 1 }} onClick={() => placeBid()}>
                        {copy.ctaRetry}
                      </Button>
                    </Flex>
                  )}
                </Flex>
              </Flex>
            )}

            {bidStep === BidStep.Complete && (
              <Flex direction="column" align="center" css={{ p: '$4' }}>
                <Box css={{ color: '$successAccent', mt: 48 }}>
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    style={{ width: '32px', height: '32px' }}
                  />
                </Box>
                <Text style="h5" css={{ textAlign: 'center', mt: 36, mb: 80 }}>
                  Offer Submitted!
                </Text>
                {onViewOffers ? (
                  <Button
                    css={{ width: '100%' }}
                    onClick={() => {
                      onViewOffers()
                    }}
                  >
                    {copy.ctaViewOffers}
                  </Button>
                ) : (
                  <Button
                    css={{ width: '100%' }}
                    onClick={() => {
                      setOpen(false)
                    }}
                  >
                    {copy.ctaClose}
                  </Button>
                )}
              </Flex>
            )}
            {bidStep === BidStep.Unavailable && !loading && (
              <Flex
                direction="column"
                align="center"
                css={{ p: '$4', gap: '$5' }}
              >
                <Box css={{ color: '$neutralSolid', mt: 48 }}>
                  <FontAwesomeIcon
                    icon={faHand}
                    style={{ width: '32px', height: '32px' }}
                  />
                </Box>

                <Text
                  style="h6"
                  css={{ maxWidth: 350, mb: '$3', textAlign: 'center' }}
                >
                  {!collectionBidSupported
                    ? 'This collection does not support placing a collection offer.'
                    : 'Oops, this collection does not support bidding.'}
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
          </Modal>
        )
      }}
    </BidModalRenderer>
  )
}

BidModal.Custom = BidModalRenderer
