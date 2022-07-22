import { styled } from '../../../stitches.config'
import React, { ReactElement, useEffect, useState, useMemo } from 'react'

import { Flex, Box, Text, Button, Switch } from '../../primitives'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Modal } from '../Modal'

import { ListModalRenderer, ListStep } from './ListModalRenderer'

import { ModalSize } from '../Modal'

import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import debounce from '../../lib/debounce'
import initialMarkets from './initialMarkets'

import Token from './TokenStats'
import MarketplaceToggle from './MarketplaceToggle'
import MarketplacePriceInput from './MarketplacePriceInput'

type Props = Pick<Parameters<typeof Modal>['0'], 'trigger'> & {
  tokenId?: string
  collectionId?: string
  onGoToToken?: () => any
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
}: Props): ReactElement {
  const [open, setOpen] = useState(false)
  const [syncProfit, setSyncProfit] = useState(true)
  const [loadedInitalPrice, setLoadedInitalPrice] = useState(false)
  const [markets, setMarkets] = useState(initialMarkets)

  return (
    <ListModalRenderer
      open={open}
      tokenId={tokenId}
      collectionId={collectionId}
    >
      {({
        token,
        collection,
        txHash,
        ethUsdPrice,
        isBanned,
        listStep,
        setListStep,
        balance,
        address,
        etherscanBaseUrl,
      }) => {
        // sync prices
        const updateMarketPrices = (_price: any, market: any) => {
          if (syncProfit) {
            let updatingMarket = markets.find((m) => m.name == market.name)
            let profit =
              (1 - (updatingMarket?.fee || 0)) *
              Number(updatingMarket?.price || 0)

            setMarkets(
              markets.map((m) => {
                let truePrice = profit / (1 - m.fee)
                m.price = Math.round((profit / (1 - m.fee)) * 1000) / 1000
                m.truePrice = truePrice
                return m
              })
            )
          }
        }

        const updateMarket = (price: any, market: any) => {
          setMarkets(
            markets.map((m) => {
              if (m.name == market.name) {
                m.price = price
                m.truePrice = price
              }
              return m
            })
          )
        }

        let debouncedUpdateMarkets = useMemo(
          () => debounce(updateMarketPrices, 500),
          [syncProfit]
        )

        useEffect(() => {
          if (token && collection && !loadedInitalPrice) {
            let startingPrice: number =
              Math.max(
                ...(token?.token?.attributes?.map((attr: any) =>
                  Number(attr?.floorAskPrice || 0)
                ) || []),
                0
              ) ||
              collection?.floorAsk?.price ||
              0

            setLoadedInitalPrice(true)
            setMarkets(
              markets.map((market) => {
                market.price = startingPrice
                market.truePrice = startingPrice
                return market
              })
            )
          }
        }, [token, collection])

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
                <Token token={token} collection={collection} />

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
                        <Box css={{ mb: '$3' }}>
                          <MarketplaceToggle
                            {...marketplace}
                            onSelection={() => {
                              setMarkets(
                                markets.map((market) => {
                                  if (market.name == marketplace.name) {
                                    return {
                                      ...market,
                                      isSelected: !market.isSelected,
                                    }
                                  } else {
                                    return market
                                  }
                                })
                              )
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
                <Token token={token} collection={collection} />

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

                    {markets.map((marketplace) => (
                      <Box css={{ mb: '$3' }}>
                        <MarketplacePriceInput
                          {...marketplace}
                          onChange={(e) => {
                            updateMarket(e.target.value, marketplace)
                            debouncedUpdateMarkets(e.target.value, marketplace)
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
          </Modal>
        )
      }}
    </ListModalRenderer>
  )
}

ListModal.Custom = ListModalRenderer
