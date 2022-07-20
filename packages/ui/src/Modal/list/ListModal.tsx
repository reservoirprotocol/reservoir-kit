import { styled } from '../../../stitches.config'
import React, { ReactElement, useState } from 'react'

import { Flex, Box, Text, Button, FormatEth, Switch } from '../../primitives'

import { Modal } from '../Modal'

import { ListModalRenderer, ListStep } from './ListModalRenderer'

import { ModalSize } from '../Modal'

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

const Img = styled('img', {
  height: 150,
  width: 150,
  borderRadius: '$borderRadius',
})

type StatProps = {
  label: string
  value: string
  toolTipText?: string
  asEth?: boolean
}

const Stat = ({
  label,
  value,
  toolTipText,
  asEth = false,
  ...props
}: StatProps) => (
  <Flex
    align="center"
    className="rk-stat-well"
    css={{
      backgroundColor: '$wellBackground',
      p: '$2',
      borderRadius: '$borderRadius',
    }}
    {...props}
  >
    <Text style="subtitle2" color="subtle" as="p" css={{ flex: 1 }}>
      {label}
    </Text>
    {asEth ? (
      <FormatEth amount={value} textStyle="subtitle2" />
    ) : (
      <Text style="subtitle2" as="p">
        {value}
      </Text>
    )}
  </Flex>
)

type MarketPlaceToggleProps = {
  name: string
  imgURL: string
  fee: number
  isSelected: boolean
  onSelection: () => void
}

const MarketPlaceToggle = ({
  name,
  imgURL,
  fee,
  isSelected,
  onSelection,
  ...props
}: MarketPlaceToggleProps) => (
  <Flex {...props} align="center">
    <Box css={{ mr: '$2' }}>
      <img src={imgURL} style={{ height: 32, width: 32, borderRadius: 4 }} />
    </Box>
    <Text style="body3" css={{ flex: 1 }}>
      {name}
    </Text>
    <Text style="subtitle2" color="subtle" css={{ mr: '$2' }}>
      Marketplace fee: {fee * 100}%
    </Text>
    <Switch checked={isSelected} onCheckedChange={onSelection} />
  </Flex>
)

Stat.toString = () => '.rk-stat-well'

export function ListModal({
  trigger,
  tokenId,
  collectionId,
  onGoToToken,
}: Props): ReactElement {
  const [open, setOpen] = useState(false)
  const [markets, setMarkets] = useState([
    {
      name: 'OpenSea',
      imgURL: 'https://api.reservoir.tools/redirect/sources/OpenSea/logo/v2',
      isSelected: false,
      fee: 0.025,
    },

    {
      name: 'LooksRare',
      imgURL: 'https://api.reservoir.tools/redirect/sources/LooksRare/logo/v2',
      isSelected: false,
      fee: 0.02,
    },
  ])

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
        balance,
        address,
        etherscanBaseUrl,
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
              <>
                <Flex
                  css={{
                    width: '100%',
                    borderTop: '1px solid $borderColor',
                    borderBottom: '1px solid $borderColor',
                  }}
                >
                  <Box
                    css={{
                      borderRight: '1px solid $borderColor',
                      width: 220,
                      p: '$4',
                    }}
                  >
                    <Text
                      style="subtitle2"
                      color="subtle"
                      css={{ mb: '$1', display: 'block' }}
                    >
                      Item
                    </Text>
                    <Img src={token?.token?.image} css={{ mb: '$1' }} />
                    <Text style="h6">
                      {token?.token?.name || `#${token?.token?.tokenId}`}
                    </Text>
                    <Box>
                      <Text style="subtitle2" color="subtle" as="p">
                        {token?.token?.collection?.name}
                      </Text>
                    </Box>
                    <Box
                      css={{
                        mt: '$4',
                        [`& ${Stat}:not(:last-child)`]: {
                          mb: '$1',
                        },
                        mb: '$3',
                      }}
                    >
                      {[
                        {
                          label: 'Creator Royalties',
                          value: '10%',
                        },
                        {
                          label: 'Last Price',
                          value: '20',
                          asEth: true,
                        },
                        {
                          label: 'Floor',
                          value: '21',
                          asEth: true,
                        },
                        {
                          label: 'Highest Trait Floor',
                          value: '21',
                          asEth: true,
                        },
                      ].map((stat) => (
                        <Stat {...stat} />
                      ))}
                    </Box>
                  </Box>

                  <Flex direction="column" css={{ flex: 1 }}>
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
                        <Text
                          style="subtitle2"
                          color="subtle"
                          css={{ mr: '$2' }}
                        >
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
                      {markets.map((marketplace) => (
                        <Box css={{ mb: '$3' }}>
                          <MarketPlaceToggle
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
                      <Button css={{ width: '100%' }}>Next</Button>
                    </Box>
                  </Flex>
                </Flex>
              </>
            )}
          </Modal>
        )
      }}
    </ListModalRenderer>
  )
}

ListModal.Custom = ListModalRenderer
