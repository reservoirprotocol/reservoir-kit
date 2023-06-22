import { styled } from '../../../stitches.config'
import React, {
  Dispatch,
  ReactElement,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from 'react'

import {
  Flex,
  Box,
  Text,
  Button,
  Loader,
  Select,
  ErrorWell,
  Popover,
} from '../../primitives'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Modal } from '../Modal'
import {
  ListingData,
  ListModalRenderer,
  ListStep,
  ListModalStepData,
} from './ListModalRenderer'
import { ModalSize } from '../Modal'
import {
  faChevronLeft,
  faCheckCircle,
  faInfoCircle,
} from '@fortawesome/free-solid-svg-icons'
import TokenStats from './TokenStats'
import MarketplaceToggle from './MarketplaceToggle'
import MarketplacePriceInput from './MarketplacePriceInput'
import TokenListingDetails from './TokenListingDetails'
import { useFallbackState, useReservoirClient } from '../../hooks'
import TransactionProgress from '../../modal/TransactionProgress'
import ProgressBar from '../../modal/ProgressBar'
import InfoTooltip from '../../primitives/InfoTooltip'
import { Marketplace } from '../../hooks/useMarketplaces'
import { Currency } from '../../types/Currency'
import SigninStep from '../SigninStep'
import { CurrencySelector } from '../CurrencySelector'
import { zeroAddress } from 'viem'
import { ProviderOptionsContext } from '../../ReservoirKitProvider'
import { CSS } from '@stitches/react'

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
  ctaEditListing: 'Edit Listing',
  ctaRetry: 'Retry',
  ctaGoToToken: 'Go to Token',
}

type Props = Pick<Parameters<typeof Modal>['0'], 'trigger'> & {
  openState?: [boolean, Dispatch<SetStateAction<boolean>>]
  tokenId?: string
  collectionId?: string
  currencies?: Currency[]
  nativeOnly?: boolean
  normalizeRoyalties?: boolean
  enableOnChainRoyalties?: boolean
  oracleEnabled?: boolean
  copyOverrides?: Partial<typeof ModalCopy>
  onGoToToken?: () => any
  onListingComplete?: (data: ListingCallbackData) => void
  onListingError?: (error: Error, data: ListingCallbackData) => void
  onClose?: (
    data: ListingCallbackData,
    stepData: ListModalStepData | null,
    currentStep: ListStep
  ) => void
}

const Image = styled('img', {})
const Span = styled('span', {})
const ContentContainer = styled(Flex, {
  width: '100%',
  borderColor: '$borderColor',
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

const MINIMUM_AMOUNT = 0.000001

export function ListModal({
  openState,
  trigger,
  tokenId,
  collectionId,
  currencies,
  nativeOnly,
  normalizeRoyalties,
  enableOnChainRoyalties = false,
  oracleEnabled = false,
  copyOverrides,
  onGoToToken,
  onListingComplete,
  onListingError,
  onClose,
}: Props): ReactElement {
  const copy: typeof ModalCopy = { ...ModalCopy, ...copyOverrides }
  const [open, setOpen] = useFallbackState(
    openState ? openState[0] : false,
    openState
  )
  const client = useReservoirClient()
  const reservoirChain = client?.currentChain()
  const [marketplacesToApprove, setMarketplacesToApprove] = useState<
    Marketplace[]
  >([])

  const providerOptionsContext = useContext(ProviderOptionsContext)

  if (oracleEnabled) {
    nativeOnly = true
  }

  return (
    <ListModalRenderer
      open={open}
      tokenId={tokenId}
      collectionId={collectionId}
      currencies={currencies}
      normalizeRoyalties={normalizeRoyalties}
      enableOnChainRoyalties={enableOnChainRoyalties}
      oracleEnabled={oracleEnabled}
    >
      {({
        token,
        quantityAvailable,
        collection,
        usdPrice,
        listStep,
        expirationOption,
        expirationOptions,
        marketplaces,
        unapprovedMarketplaces,
        isFetchingOnChainRoyalties,
        localMarketplace,
        listingData,
        transactionError,
        stepData,
        currencies,
        currency,
        quantity,
        royaltyBps,
        setListStep,
        listToken,
        setMarketPrice,
        setCurrency,
        toggleMarketplace,
        setExpirationOption,
        setQuantity,
      }) => {
        const tokenImage =
          token && token.token?.imageSmall
            ? token.token.imageSmall
            : (collection?.image as string)

        useEffect(() => {
          if (nativeOnly) {
            setListStep(ListStep.SetPrice)
          }
        }, [nativeOnly, open])

        useEffect(() => {
          if (unapprovedMarketplaces.length > 0) {
            const unapprovedNames = unapprovedMarketplaces.reduce(
              (names, marketplace) => {
                if (
                  marketplace.name &&
                  localMarketplace?.orderKind !== marketplace.orderKind
                ) {
                  names.push(marketplace.name)
                }
                return names
              },
              [] as string[]
            )
            setMarketplacesToApprove(
              marketplaces.filter(
                (marketplace) =>
                  marketplace.isSelected &&
                  marketplace.name &&
                  unapprovedNames.includes(marketplace.name)
              )
            )
          } else {
            setMarketplacesToApprove([])
          }
        }, [unapprovedMarketplaces, marketplaces, localMarketplace])

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

        const availableMarketplaces = marketplaces.filter((market) => {
          const isNative = market.orderbook === 'reservoir'
          return nativeOnly
            ? market.listingEnabled && isNative
            : market.listingEnabled
        })

        const selectedMarketplaces = availableMarketplaces.filter(
          (marketplace) => marketplace.isSelected
        )
        const quantitySelectionAvailable = selectedMarketplaces.every(
          (marketplace) =>
            marketplace.orderbook === 'reservoir' ||
            marketplace.orderbook === 'opensea'
        )

        let loading =
          !token ||
          !collection ||
          (enableOnChainRoyalties ? isFetchingOnChainRoyalties : false)

        const contentContainerCss: CSS = {
          borderBottomWidth: providerOptionsContext.disablePoweredByReservoir
            ? 0
            : 1,
          marginBottom: providerOptionsContext.disablePoweredByReservoir
            ? 0
            : 12,
        }

        return (
          <Modal
            trigger={trigger}
            size={ModalSize.LG}
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
          >
            {!loading && listStep == ListStep.SelectMarkets && (
              <ContentContainer
                css={{
                  ...contentContainerCss,
                }}
              >
                <TokenStats
                  token={token}
                  collection={collection}
                  royaltyBps={royaltyBps}
                />

                <MainContainer>
                  <Box css={{ p: '$4', flex: 1 }}>
                    {currencies.length > 1 ? (
                      <Text
                        style="subtitle1"
                        as={Flex}
                        css={{ mb: '$4', gap: '$2', alignItems: 'center' }}
                      >
                        List item in
                        <CurrencySelector
                          currency={currency}
                          currencies={currencies}
                          setCurrency={setCurrency}
                        />
                      </Text>
                    ) : (
                      <Text style="subtitle1" as="h3" css={{ mb: '$4' }}>
                        {availableMarketplaces.length > 1
                          ? 'Select Marketplaces'
                          : 'Available Marketplace'}
                      </Text>
                    )}

                    <Text style="subtitle2" as="p" color="subtle">
                      Default
                    </Text>
                    <Flex align="center" css={{ mb: '$4', mt: '$2' }}>
                      <Box css={{ mr: '$2' }}>
                        <img
                          src={localMarketplace?.imageUrl || ''}
                          style={{
                            height: 32,
                            width: 32,
                            borderRadius: 4,
                            visibility: localMarketplace?.imageUrl
                              ? 'visible'
                              : 'hidden',
                          }}
                        />
                      </Box>
                      <Box css={{ mr: '$2', flex: 1 }}>
                        <Text style="body3">{localMarketplace?.name}</Text>
                        <Flex css={{ alignItems: 'center', gap: 8 }}>
                          <Text style="body3" color="subtle" as="div">
                            on Reservoir
                          </Text>
                          <InfoTooltip
                            side="bottom"
                            width={200}
                            content={
                              'Listings made on this marketplace will be distributed across the reservoir ecosystem'
                            }
                          />
                        </Flex>
                      </Box>
                      <Text style="subtitle2" color="subtle" css={{ mr: '$2' }}>
                        Marketplace fee:{' '}
                        {((localMarketplace?.fee?.bps || 0) / 10000) * 100}%
                      </Text>
                    </Flex>
                    {availableMarketplaces.length > 1 && (
                      <Text
                        style="subtitle2"
                        color="subtle"
                        as="p"
                        css={{ mb: '$2' }}
                      >
                        Select other marketplaces to list on
                      </Text>
                    )}
                    {availableMarketplaces
                      .filter(
                        (marketplace) => marketplace.orderbook !== 'reservoir'
                      )
                      .map((marketplace) => (
                        <Box key={marketplace.name} css={{ mb: '$3' }}>
                          <MarketplaceToggle
                            marketplace={marketplace}
                            onSelection={() => {
                              toggleMarketplace(marketplace)
                            }}
                          />
                        </Box>
                      ))}
                  </Box>
                  <Box css={{ p: '$4', width: '100%' }}>
                    {marketplacesToApprove.length > 0 && (
                      <Text
                        color="accent"
                        style="subtitle2"
                        css={{
                          my: 10,
                          width: '100%',
                          textAlign: 'center',
                          display: 'block',
                        }}
                      >
                        {`Additional Gas fee required to approve listing (${marketplacesToApprove
                          .map((marketplace) => marketplace.name)
                          .join(', ')})`}
                      </Text>
                    )}
                    {oracleEnabled && (
                      <Text
                        style="body3"
                        color="subtle"
                        css={{
                          mb: 10,
                          textAlign: 'center',
                          width: '100%',
                          display: 'block',
                        }}
                      >
                        You can change or cancel your listing for free on{' '}
                        {localMarketplace?.name}.
                      </Text>
                    )}
                    <Button
                      onClick={() => setListStep(ListStep.SetPrice)}
                      css={{ width: '100%' }}
                    >
                      {copy.ctaSetPrice}
                    </Button>
                  </Box>
                </MainContainer>
              </ContentContainer>
            )}
            {!loading && listStep == ListStep.SetPrice && (
              <ContentContainer
                css={{
                  ...contentContainerCss,
                }}
              >
                <TokenStats
                  token={token}
                  collection={collection}
                  royaltyBps={royaltyBps}
                />

                <MainContainer>
                  <Box css={{ p: '$4', flex: 1 }}>
                    <Flex align="center" css={{ mb: '$4' }}>
                      {!nativeOnly ? (
                        <Button
                          color="ghost"
                          size="none"
                          css={{ mr: '$2', color: '$neutralText' }}
                          onClick={() => setListStep(ListStep.SelectMarkets)}
                        >
                          <FontAwesomeIcon
                            icon={faChevronLeft}
                            width={16}
                            height={16}
                          />
                        </Button>
                      ) : null}
                      <Text style="subtitle1" as="h3">
                        Set Your Price
                      </Text>
                    </Flex>
                    {quantityAvailable > 1 && quantitySelectionAvailable && (
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
                          style="body2"
                          css={{ mb: 24, display: 'inline-block' }}
                        >
                          {quantityAvailable} items available
                        </Text>
                      </>
                    )}
                    <Flex css={{ mb: '$2' }} justify="between">
                      <Text style="subtitle2" color="subtle" as="p">
                        {quantityAvailable > 1 && quantitySelectionAvailable
                          ? 'Unit Price'
                          : 'Price'}
                      </Text>
                      <Flex css={{ alignItems: 'center', gap: 8 }}>
                        <Text style="subtitle2" color="subtle" as="p">
                          {quantityAvailable > 1 && quantitySelectionAvailable
                            ? 'Total Profit'
                            : 'Profit'}
                        </Text>
                        {nativeOnly ? (
                          <Popover
                            side="left"
                            content={
                              <Flex direction="column" css={{ gap: '$3' }}>
                                <Flex justify="between" css={{ gap: '$4' }}>
                                  <Text style="body3">Marketplace Fee</Text>
                                  <Text style="subtitle2" color="subtle">
                                    {localMarketplace?.fee?.percent || 0}%
                                  </Text>
                                </Flex>
                                <Flex justify="between" css={{ gap: '$4' }}>
                                  <Text style="body3">Creator Royalties</Text>
                                  <Text style="subtitle2" color="subtle">
                                    {(royaltyBps || 0) * 0.01}%
                                  </Text>
                                </Flex>
                              </Flex>
                            }
                          >
                            <Box
                              css={{
                                color: '$neutralText',
                              }}
                            >
                              <FontAwesomeIcon icon={faInfoCircle} />
                            </Box>
                          </Popover>
                        ) : (
                          <InfoTooltip
                            side="left"
                            width={200}
                            content={`How much ${currency.symbol} you will receive after marketplace fees and creator royalties are subtracted.`}
                          />
                        )}
                      </Flex>
                    </Flex>

                    {selectedMarketplaces.map((marketplace) => (
                      <Box key={marketplace.name} css={{ mb: '$3' }}>
                        <MarketplacePriceInput
                          marketplace={marketplace}
                          collection={collection}
                          currency={currency}
                          currencies={currencies}
                          setCurrency={setCurrency}
                          usdPrice={usdPrice}
                          quantity={quantity}
                          nativeOnly={nativeOnly}
                          onChange={(e) => {
                            setMarketPrice(e.target.value, marketplace)
                          }}
                          onBlur={() => {
                            if (marketplace.price === '') {
                              setMarketPrice(0, marketplace)
                            }
                          }}
                        />
                        {marketplace.truePrice !== '' &&
                          marketplace.truePrice !== null &&
                          Number(marketplace.truePrice) !== 0 &&
                          Number(marketplace.truePrice) < MINIMUM_AMOUNT && (
                            <Box>
                              <Text style="body2" color="error">
                                Amount must be higher than {MINIMUM_AMOUNT}
                              </Text>
                            </Box>
                          )}
                        {collection &&
                          collection?.floorAsk?.price?.amount?.native !==
                            undefined &&
                          marketplace.truePrice !== '' &&
                          marketplace.truePrice !== null &&
                          Number(marketplace.truePrice) !== 0 &&
                          Number(marketplace.truePrice) >= MINIMUM_AMOUNT &&
                          currency.contract === zeroAddress &&
                          Number(marketplace.truePrice) <
                            collection?.floorAsk?.price.amount.native && (
                            <Box>
                              <Text style="body2" color="error">
                                Price is{' '}
                                {Math.round(
                                  ((collection.floorAsk.price.amount.native -
                                    +marketplace.truePrice) /
                                    ((collection.floorAsk.price.amount.native +
                                      +marketplace.truePrice) /
                                      2)) *
                                    100 *
                                    1000
                                ) / 1000}
                                % below the floor
                              </Text>
                            </Box>
                          )}
                      </Box>
                    ))}
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
                  </Box>
                  <Box css={{ p: '$4', width: '100%' }}>
                    <Button
                      disabled={selectedMarketplaces.some(
                        (marketplace) =>
                          marketplace.price === '' ||
                          marketplace.price == 0 ||
                          Number(marketplace.price) < MINIMUM_AMOUNT
                      )}
                      onClick={listToken}
                      css={{ width: '100%' }}
                    >
                      {copy.ctaList}
                    </Button>
                  </Box>
                </MainContainer>
              </ContentContainer>
            )}
            {!loading && listStep == ListStep.ListItem && (
              <ContentContainer
                css={{
                  ...contentContainerCss,
                }}
              >
                <TokenListingDetails
                  token={token}
                  collection={collection}
                  listingData={listingData}
                  currency={currency}
                />
                <MainContainer css={{ p: '$4' }}>
                  <ProgressBar
                    value={stepData?.stepProgress || 0}
                    max={stepData?.totalSteps || 0}
                  />
                  {transactionError && <ErrorWell css={{ mt: 24 }} />}
                  {stepData && stepData.currentStep.id === 'auth' ? (
                    <SigninStep css={{ mt: 48, mb: '$4', gap: 20 }} />
                  ) : null}
                  {stepData && stepData.currentStep.id !== 'auth' ? (
                    <>
                      <Text
                        css={{ textAlign: 'center', mt: 48, mb: 28 }}
                        style="subtitle1"
                      >
                        {stepData.currentStep.kind === 'transaction'
                          ? 'Approve access to items\nin your wallet'
                          : 'Confirm listing in your wallet'}
                      </Text>
                      <TransactionProgress
                        justify="center"
                        fromImg={tokenImage}
                        toImgs={stepData?.listingData.map(
                          (listing) => listing.marketplace.imageUrl || ''
                        )}
                      />
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
                  ) : null}
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
                      {copy.ctaAwaitingApproval}
                    </Button>
                  )}
                  {transactionError && (
                    <Flex css={{ mt: 'auto', gap: 10 }}>
                      <Button
                        color="secondary"
                        css={{ flex: 1 }}
                        onClick={() => setListStep(ListStep.SetPrice)}
                      >
                        {copy.ctaEditListing}
                      </Button>
                      <Button css={{ flex: 1 }} onClick={() => listToken()}>
                        {copy.ctaRetry}
                      </Button>
                    </Flex>
                  )}
                </MainContainer>
              </ContentContainer>
            )}
            {!loading && listStep == ListStep.Complete && (
              <ContentContainer
                css={{
                  ...contentContainerCss,
                }}
              >
                <TokenListingDetails
                  token={token}
                  collection={collection}
                  listingData={listingData}
                  currency={currency}
                />
                <MainContainer css={{ p: '$4' }}>
                  <ProgressBar
                    value={stepData?.totalSteps || 0}
                    max={stepData?.totalSteps || 0}
                  />
                  <Flex
                    align="center"
                    justify="center"
                    direction="column"
                    css={{ flex: 1, textAlign: 'center', py: '$5' }}
                  >
                    <Box css={{ color: '$successAccent', mb: 24 }}>
                      <FontAwesomeIcon icon={faCheckCircle} size="3x" />
                    </Box>
                    <Text style="h5" css={{ mb: '$2' }} as="h5">
                      Your item has been listed!
                    </Text>
                    <Text
                      style="body3"
                      color="subtle"
                      as="p"
                      css={{ mb: 24, maxWidth: 300, overflow: 'hidden' }}
                    >
                      <Text color="accent" ellipsify style="body3">
                        {token?.token?.name
                          ? token?.token?.name
                          : `#${token?.token?.tokenId}`}
                      </Text>{' '}
                      from{' '}
                      <Span css={{ color: '$accentText' }}>
                        {token?.token?.collection?.name}
                      </Span>{' '}
                      has been listed for sale
                    </Text>
                    <Text style="subtitle2" as="p" css={{ mb: '$3' }}>
                      View Listing on
                    </Text>
                    <Flex css={{ gap: '$3' }}>
                      {listingData.map((data) => {
                        const source =
                          data.listing.orderbook === 'reservoir' &&
                          client?.source
                            ? client?.source
                            : data.marketplace.domain
                        return (
                          <a
                            key={data.listing.orderbook}
                            target="_blank"
                            href={`${reservoirChain?.baseApiUrl}/redirect/sources/${source}/tokens/${token?.token?.contract}:${token?.token?.tokenId}/link/v2`}
                          >
                            <Image
                              css={{ width: 24 }}
                              src={data.marketplace.imageUrl}
                            />
                          </a>
                        )
                      })}
                    </Flex>
                  </Flex>

                  <Flex
                    css={{
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
                </MainContainer>
              </ContentContainer>
            )}
          </Modal>
        )
      }}
    </ListModalRenderer>
  )
}

ListModal.Custom = ListModalRenderer
