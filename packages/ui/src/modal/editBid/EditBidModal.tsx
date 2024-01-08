import { useFallbackState, useReservoirClient } from '../../hooks'
import React, {
  ReactElement,
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
  ComponentPropsWithoutRef,
  useContext,
} from 'react'
import {
  Flex,
  Text,
  Box,
  Button,
  Loader,
  Select,
  FormatWrappedCurrency,
  Popover,
  FormatCryptoCurrency,
  CryptoCurrencyIcon,
  Input,
  FormatCurrency,
  ErrorWell,
} from '../../primitives'
import PseudoInput from '../../primitives/PseudoInput'
import AttributeSelector from '../bid/AttributeSelector'
import { EditBidModalRenderer, EditBidStep } from './EditBidModalRenderer'
import { Modal } from '../Modal'
import getLocalMarketplaceData from '../../lib/getLocalMarketplaceData'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle, faClose } from '@fortawesome/free-solid-svg-icons'
import { ReservoirWallet } from '@reservoir0x/reservoir-sdk'
import { WalletClient, formatUnits } from 'viem'
import { formatNumber } from '../../lib/numbers'
import { Dialog } from '../../primitives/Dialog'
import TokenInfo from '../bid/TokenInfo'
import { ProviderOptionsContext } from '../../ReservoirKitProvider'
import TransactionProgress from '../TransactionProgress'
import QuantitySelector from '../QuantitySelector'
import { Currency } from '../../types/Currency'

const ModalCopy = {
  title: 'Edit Offer',
  ctaClose: 'Close',
  ctaConfirm: 'Confirm',
  ctaDisabled: 'Enter a Price',
  ctaEditOffer: 'Edit Offer',
  ctaRetry: 'Retry',
  ctaConvertManually: 'Convert Manually',
  ctaConvertAutomatically: '',
  ctaAwaitingApproval: 'Waiting for approval...',
  ctaAwaitingValidation: 'Waiting for transaction to be validated',
}

type Props = Pick<Parameters<typeof Modal>['0'], 'trigger'> & {
  openState?: [boolean, Dispatch<SetStateAction<boolean>>]
  bidId?: string
  tokenId?: string
  chainId?: number
  collectionId?: string
  normalizeRoyalties?: boolean
  enableOnChainRoyalties?: boolean
  copyOverrides?: Partial<typeof ModalCopy>
  walletClient?: ReservoirWallet | WalletClient
  onClose?: (data: any, currentStep: EditBidStep) => void
  onEditBidComplete?: (data: any) => void
  onEditBidError?: (error: Error, data: any) => void
  onPointerDownOutside?: ComponentPropsWithoutRef<
    typeof Dialog
  >['onPointerDownOutside']
}

const MINIMUM_AMOUNT = 0.000001
const MAXIMUM_AMOUNT = Infinity

export function EditBidModal({
  openState,
  bidId,
  tokenId,
  chainId,
  collectionId,
  trigger,
  normalizeRoyalties,
  copyOverrides,
  walletClient,
  onClose,
  onEditBidComplete,
  onEditBidError,
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

  return (
    <EditBidModalRenderer
      chainId={modalChain?.id}
      bidId={bidId}
      tokenId={tokenId}
      collectionId={collectionId}
      open={open}
      normalizeRoyalties={normalizeRoyalties}
      walletClient={walletClient}
    >
      {({
        loading,
        bid,
        attributes,
        trait,
        isOracleOrder,
        isTokenBid,
        quantity,
        bidAmountPerUnit,
        totalBidAmount,
        totalBidAmountUsd,
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
        exchange,
        traitBidSupported,
        partialBidSupported,
        currency,
        setQuantity,
        setTrait,
        setBidAmountPerUnit,
        setExpirationOption,
        setEditBidStep,
        editBid,
      }) => {
        const providerOptionsContext = useContext(ProviderOptionsContext)

        const [attributeSelectorOpen, setAttributeSelectorOpen] =
          useState(false)

        const [attributesSelectable, setAttributesSelectable] = useState(false)
        const tokenCount = collection?.tokenCount
          ? +collection.tokenCount
          : undefined

        const itemImage = isTokenBid
          ? bid?.criteria?.data?.token?.image || token?.token?.imageSmall
          : bid?.criteria?.data?.collection?.image || collection?.image

        const quantityEnabled =
          partialBidSupported &&
          (!tokenId ||
            (token?.token?.kind === 'erc1155' &&
              Number(token?.token?.supply) > 1))

        const [localMarketplace, setLocalMarketplace] = useState<ReturnType<
          typeof getLocalMarketplaceData
        > | null>(null)

        useEffect(() => {
          setLocalMarketplace(getLocalMarketplaceData())
        }, [])

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

        const canPurchase = totalBidAmount !== 0 && withinPricingBounds

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
            onPointerDownOutside={(e) => {
              if (onPointerDownOutside) {
                onPointerDownOutside(e)
              }
            }}
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
            {editBidStep === EditBidStep.Edit && isBidEditable && collection && (
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

                    <Flex css={{ mt: '$2', gap: 20 }}>
                      <Text
                        as={Flex}
                        css={{ gap: '$2', flexShrink: 0 }}
                        align="center"
                        style="body1"
                        color="subtle"
                      >
                        <CryptoCurrencyIcon
                          chainId={modalChain?.id}
                          css={{ height: 20 }}
                          address={wrappedContractAddress}
                        />
                        {wrappedContractName}
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
                    <Select
                      css={{
                        flex: 1,
                        width: '100%',
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
                    {!canPurchase && (
                      <Button disabled={true} css={{ width: '100%' }}>
                        {copy.ctaDisabled}
                      </Button>
                    )}
                    {canPurchase && hasEnoughWrappedCurrency && (
                      <Button onClick={editBid} css={{ width: '100%' }}>
                        {copy.ctaConfirm}
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
                              ? copy.ctaConfirm
                              : copy.ctaConvertManually}
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
                      </>
                    )}
                  </Box>
                </Flex>
              </Flex>
            )}
            {editBidStep === EditBidStep.Approving && collection && (
              <Flex direction="column">
                <TokenInfo
                  chain={modalChain}
                  token={token ? token : undefined}
                  collection={collection}
                  price={totalBidAmount}
                  currency={currency as Currency}
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
                        {stepData.currentStep.action}
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
                        onClick={() => setEditBidStep(EditBidStep.Edit)}
                      >
                        {copy.ctaEditOffer}
                      </Button>
                      <Button css={{ flex: 1 }} onClick={editBid}>
                        {copy.ctaRetry}
                      </Button>
                    </Flex>
                  )}
                </Flex>
              </Flex>
            )}
            {editBidStep === EditBidStep.Complete && (
              <Flex direction="column" align="center" css={{ p: '$4' }}>
                <Box css={{ color: '$successAccent', mt: 48 }}>
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    style={{ width: '32px', height: '32px' }}
                  />
                </Box>
                <Text style="h5" css={{ textAlign: 'center', mt: 36, mb: 80 }}>
                  Offer Updated!
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
    </EditBidModalRenderer>
  )
}

EditBidModal.Custom = EditBidModalRenderer
