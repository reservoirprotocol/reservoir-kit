import { styled } from '../../../stitches.config'
import React, { ReactElement, useEffect, useState } from 'react'

import {
  Flex,
  Box,
  Text,
  Button,
  ToggleGroup,
  ToggleGroupButton,
  Loader,
  Select,
} from '../../primitives'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Modal } from '../Modal'
import { ListingData, ListModalRenderer, ListStep } from './ListModalRenderer'
import { ModalSize } from '../Modal'
import {
  faChevronLeft,
  faCheckCircle,
  faCircleExclamation,
} from '@fortawesome/free-solid-svg-icons'
import TokenStats from './TokenStats'
import MarketplaceToggle from './MarketplaceToggle'
import MarketplacePriceInput from './MarketplacePriceInput'
import TokenListingDetails from './TokenListingDetails'
import ProgressBar from './ProgressBar'
import { useReservoirClient } from '../../hooks'
import ListingTransactionProgress from './ListingTransactionProgress'
import InfoTooltip from './InfoTooltip'
import { Marketplace } from '../../hooks/useMarketplaces'

type ListingCallbackData = {
  listings?: ListingData[]
  tokenId?: string
  collectionId?: string
}

type Props = Pick<Parameters<typeof Modal>['0'], 'trigger'> & {
  tokenId?: string
  collectionId?: string
  ethUsdPrice?: number
  onGoToToken?: () => any
  onListingComplete?: (data: ListingCallbackData) => void
  onListingError?: (error: Error, data: ListingCallbackData) => void
  onClose?: () => void
}

const Image = styled('img', {})
const Span = styled('span', {})
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

export function ListModal({
  trigger,
  tokenId,
  collectionId,
  onGoToToken,
  onListingComplete,
  onListingError,
  onClose,
}: Props): ReactElement {
  const [open, setOpen] = useState(false)
  const [stepTitle, setStepTitle] = useState('')
  const client = useReservoirClient()
  const [marketplacesToApprove, setMarketplacesToApprove] = useState<
    Marketplace[]
  >([])

  return (
    <ListModalRenderer
      open={open}
      tokenId={tokenId}
      collectionId={collectionId}
    >
      {({
        token,
        collection,
        ethUsdPrice,
        listStep,
        expirationOption,
        expirationOptions,
        marketplaces,
        unapprovedMarketplaces,
        isFetchingUnapprovedMarketplaces,
        localMarketplace,
        syncProfit,
        listingData,
        transactionError,
        stepData,
        setListStep,
        listToken,
        setMarketPrice,
        toggleMarketplace,
        setSyncProfit,
        setExpirationOption,
      }) => {
        const tokenImage =
          token && token.token?.image
            ? token.token.image
            : (collection?.metadata?.imageUrl as string)

        useEffect(() => {
          if (stepData) {
            const marketplaceName = stepData.listingData.marketplace.name
            switch (stepData.currentStep.kind) {
              case 'transaction': {
                setStepTitle(
                  `Approve ${marketplaceName} to access item\nin your wallet`
                )
                break
              }
              case 'signature': {
                setStepTitle(
                  `Confirm listing on ${marketplaceName}\nin your wallet`
                )
                break
              }
            }
          }
        }, [stepData])

        useEffect(() => {
          if (unapprovedMarketplaces.length > 0) {
            const unapprovedNames = unapprovedMarketplaces.map(
              (marketplace) => marketplace.name
            )
            setMarketplacesToApprove(
              marketplaces.filter(
                (marketplace) =>
                  marketplace.isSelected &&
                  unapprovedNames.includes(marketplace.name)
              )
            )
          } else {
            setMarketplacesToApprove([])
          }
        }, [unapprovedMarketplaces, marketplaces])

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

        return (
          <Modal
            trigger={trigger}
            size={ModalSize.LG}
            title="List Item for sale"
            open={open}
            onOpenChange={(open) => {
              setOpen(open)
            }}
            loading={!token}
          >
            {token && listStep == ListStep.SelectMarkets && (
              <ContentContainer>
                <TokenStats token={token} collection={collection} />

                <MainContainer>
                  <Box css={{ p: '$4', flex: 1 }}>
                    <Text style="subtitle1" as="h3" css={{ mb: '$4' }}>
                      Select Marketplaces
                    </Text>
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
                        <Text style="body3" color="subtle" as="div">
                          on Reservoir{' '}
                          <InfoTooltip
                            side="bottom"
                            width={200}
                            content={
                              'Listings made on this marketplace will be distributed across the reservoir ecosystem'
                            }
                          />
                        </Text>
                      </Box>
                      <Text style="subtitle2" color="subtle" css={{ mr: '$2' }}>
                        Marketplace fee:{' '}
                        {((localMarketplace?.fee?.bps || 0) / 10000) * 100}%
                      </Text>
                    </Flex>
                    <Text
                      style="subtitle2"
                      color="subtle"
                      as="p"
                      css={{ mb: '$2' }}
                    >
                      Select other marketplaces to list on
                    </Text>
                    {marketplaces
                      .filter(
                        (market) =>
                          market.orderbook !== 'reservoir' &&
                          market.listingEnabled
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
                    {!isFetchingUnapprovedMarketplaces &&
                      !marketplacesToApprove.length && (
                        <Text
                          color="success"
                          style="subtitle2"
                          css={{
                            my: 10,
                            width: '100%',
                            textAlign: 'center',
                            display: 'block',
                          }}
                        >
                          All marketplaces approved, no gas fee required!
                        </Text>
                      )}
                    {(marketplacesToApprove.length > 0 ||
                      isFetchingUnapprovedMarketplaces) && (
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
                        {isFetchingUnapprovedMarketplaces
                          ? 'Checking if gas fee required...'
                          : `Gas fee required to approve listing (${marketplacesToApprove
                              .map((marketplace) => marketplace.name)
                              .join(', ')})`}
                      </Text>
                    )}
                    <Button
                      onClick={() => setListStep(ListStep.SetPrice)}
                      css={{ width: '100%' }}
                    >
                      Next
                    </Button>
                  </Box>
                </MainContainer>
              </ContentContainer>
            )}
            {token && listStep == ListStep.SetPrice && (
              <ContentContainer>
                <TokenStats token={token} collection={collection} />

                <MainContainer>
                  <Box css={{ p: '$4', flex: 1 }}>
                    <Flex align="center" css={{ mb: '$4' }}>
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
                      <Text style="subtitle1" as="h3">
                        Set Your Price
                      </Text>
                    </Flex>
                    <Flex align="center" css={{ mb: '$4' }} justify="center">
                      <ToggleGroup
                        type="single"
                        value={syncProfit ? 'sync' : 'custom'}
                        onValueChange={(value) =>
                          setSyncProfit(value === 'sync')
                        }
                      >
                        <ToggleGroupButton value="sync">
                          <Text style="subtitle2">Same Profit</Text>
                        </ToggleGroupButton>
                        <ToggleGroupButton value="custom">
                          <Text style="subtitle2">Custom</Text>
                        </ToggleGroupButton>
                      </ToggleGroup>
                    </Flex>
                    <Flex css={{ mb: '$2' }} justify="between">
                      <Text style="subtitle2" color="subtle" as="p">
                        List Price
                      </Text>
                      <Flex align="center">
                        <Text
                          style="subtitle2"
                          color="subtle"
                          as="p"
                          css={{ mr: '$2' }}
                        >
                          Profit
                        </Text>
                        <InfoTooltip
                          side="left"
                          width={200}
                          content={
                            'How much ETH you will receive after marketplace fees and creator royalties are subtracted.'
                          }
                        />
                      </Flex>
                    </Flex>

                    {marketplaces
                      .filter((marketplace) => marketplace.isSelected)
                      .map((marketplace) => (
                        <Box key={marketplace.name} css={{ mb: '$3' }}>
                          <MarketplacePriceInput
                            marketplace={marketplace}
                            ethUsdPrice={ethUsdPrice}
                            onChange={(e) => {
                              setMarketPrice(e.target.value, marketplace)
                            }}
                            onBlur={() => {
                              if (marketplace.price === '') {
                                setMarketPrice(0, marketplace)
                              }
                            }}
                          />
                          {collection?.floorAsk?.price !== undefined &&
                            marketplace.truePrice !== null &&
                            marketplace.truePrice <
                              collection?.floorAsk?.price && (
                              <Box>
                                <Text style="body2" color="error">
                                  Price is{' '}
                                  {Math.round(
                                    ((collection.floorAsk.price -
                                      +marketplace.truePrice) /
                                      ((collection.floorAsk.price +
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
                      disabled={marketplaces.some(
                        (marketplace) => marketplace.price === ''
                      )}
                      onClick={listToken}
                      css={{ width: '100%' }}
                    >
                      Next
                    </Button>
                  </Box>
                </MainContainer>
              </ContentContainer>
            )}
            {token && listStep == ListStep.ListItem && (
              <ContentContainer>
                <TokenListingDetails
                  token={token}
                  collection={collection}
                  listingData={listingData}
                />
                <MainContainer css={{ p: '$4' }}>
                  <ProgressBar
                    value={stepData?.stepProgress || 0}
                    max={stepData?.totalSteps || 0}
                  />
                  {transactionError && (
                    <Flex
                      css={{
                        color: '$errorAccent',
                        p: '$4',
                        gap: '$2',
                        background: '$wellBackground',
                        mt: 24,
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
                  {stepData && (
                    <>
                      <Text
                        css={{ textAlign: 'center', mt: 48, mb: 28 }}
                        style="subtitle1"
                      >
                        {stepTitle}
                      </Text>
                      <ListingTransactionProgress
                        justify="center"
                        fromImg={tokenImage}
                        toImg={stepData?.listingData.marketplace.imageUrl || ''}
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
                        onClick={() => setListStep(ListStep.SetPrice)}
                      >
                        Edit Listing
                      </Button>
                      <Button css={{ flex: 1 }} onClick={() => listToken()}>
                        Retry
                      </Button>
                    </Flex>
                  )}
                </MainContainer>
              </ContentContainer>
            )}
            {token && listStep == ListStep.Complete && (
              <ContentContainer>
                <TokenListingDetails
                  token={token}
                  collection={collection}
                  listingData={listingData}
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
                            : data.marketplace.name
                        return (
                          <a
                            key={data.listing.orderbook}
                            target="_blank"
                            href={`${client?.apiBase}/redirect/sources/${source}/tokens/${token.token?.contract}:${token?.token?.tokenId}/link/v2`}
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
                            if (onClose) {
                              onClose()
                            }
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
