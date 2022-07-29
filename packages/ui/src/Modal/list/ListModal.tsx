import { styled } from '../../../stitches.config'
import React, { ReactElement, useState } from 'react'

import {
  Flex,
  Box,
  Text,
  Button,
  Switch,
  Loader,
  Select,
} from '../../primitives'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Modal } from '../Modal'
import { ListModalRenderer, ListStep } from './ListModalRenderer'
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

type Props = Pick<Parameters<typeof Modal>['0'], 'trigger'> & {
  tokenId?: string
  collectionId?: string
  ethUsdPrice?: number
  onGoToToken?: () => any
  onComplete?: () => void
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
  onComplete,
}: Props): ReactElement {
  const [open, setOpen] = useState(false)
  const client = useReservoirClient()

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
        markets,
        syncProfit,
        listingData,
        transactionError,
        setListStep,
        listToken,
        updateMarket,
        toggleMarketplace,
        setSyncProfit,
        setExpirationOption,
      }) => {
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
                          src="https://uploads-ssl.webflow.com/620e7cf70a42fe89735b1b17/62901415219ac32d60cc658b_chimpers-logo-head.png"
                          style={{ height: 32, width: 32, borderRadius: 4 }}
                        />
                      </Box>
                      <Text style="body3" css={{ flex: 1 }}>
                        Chimpers Market
                      </Text>
                      <Text style="subtitle2" color="subtle" css={{ mr: '$2' }}>
                        Marketplace fee: 0%
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
                    {markets
                      .filter((market) => !market.isNative)
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
                    <Flex align="center" css={{ mb: '$4' }} justify="between">
                      <Text style="subtitle2" as="p" color="subtle">
                        Get the same amount of ETH across different marketplaces
                      </Text>
                      <Switch
                        checked={syncProfit}
                        onCheckedChange={(isChecked: boolean) =>
                          setSyncProfit(!syncProfit)
                        }
                      />
                    </Flex>
                    <Flex css={{ mb: '$2' }} justify="between">
                      <Text style="subtitle2" color="subtle" as="p">
                        List Price
                      </Text>
                      <Text style="subtitle2" color="subtle" as="p">
                        You Get
                      </Text>
                    </Flex>

                    {markets
                      .filter((marketplace) => !!marketplace.isSelected)
                      .map((marketplace) => (
                        <Box key={marketplace.name} css={{ mb: '$3' }}>
                          <MarketplacePriceInput
                            marketplace={marketplace}
                            ethUsdPrice={ethUsdPrice}
                            onChange={(e) => {
                              updateMarket(e.target.value, marketplace)
                            }}
                          />
                        </Box>
                      ))}
                  </Box>
                  <Box css={{ p: '$4', width: '100%' }}>
                    <Box css={{ mb: '$3' }}>
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
                    <Button onClick={listToken} css={{ width: '100%' }}>
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
                  <ProgressBar value={1} max={8} />
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
                  <Text
                    css={{ textAlign: 'center', mt: 48, mb: 28 }}
                    style="subtitle1"
                  >
                    Approve Opensea to access item <br /> in your wallet
                  </Text>
                  <ListingTransactionProgress
                    justify="center"
                    fromImg={
                      'https://api.reservoir.tools/redirect/sources/OpenSea/logo/v2'
                    }
                    toImg={
                      'https://api.reservoir.tools/redirect/sources/OpenSea/logo/v2'
                    }
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
                    We'll ask your approval for the marketplace exchange to
                    access your token. This is a one-time only operation per
                    collection.
                  </Text>
                  {!transactionError && (
                    <Button css={{ width: '100%', mt: 'auto' }} disabled={true}>
                      <Loader />
                      Waiting for Approval
                    </Button>
                  )}
                  {transactionError && (
                    <Flex css={{ mt: 'auto', gap: 10 }}>
                      <Button
                        color="ghost"
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
                  <ProgressBar value={8} max={8} />
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
                      css={{ mb: 24, maxWidth: 300 }}
                    >
                      <Span css={{ color: '$accentText' }}>
                        #{token?.token?.tokenId}
                      </Span>{' '}
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
                      {listingData.map((listing) => (
                        <a
                          target="_blank"
                          href={`${client?.apiBase}/redirect/sources/${listing.marketplace.name}/tokens/${token.token?.contract}:${token?.token?.tokenId}/link/v2`}
                        >
                          <Image
                            css={{ width: 24 }}
                            src={`${client?.apiBase}/redirect/sources/${listing.marketplace.name}/logo/v2`}
                          />
                        </a>
                      ))}
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
                            if (onComplete) {
                              onComplete()
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
                            if (onComplete) {
                              onComplete()
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
                          if (onComplete) {
                            onComplete()
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
