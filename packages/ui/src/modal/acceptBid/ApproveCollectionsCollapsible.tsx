import React, { FC, useEffect, useMemo, useState } from 'react'
import { Execute, ReservoirChain } from '@reservoir0x/reservoir-sdk'
import { ApproveCollapsible } from '../ApproveCollapisble'
import { EnhancedAcceptBidTokenData } from './AcceptBidModalRenderer'
import { Box, Flex, Grid, Img, Loader, Text } from '../../primitives'
import { styled } from '@stitches/react'

type Props = {
  step: NonNullable<Execute['steps'][0]>
  tokensData: EnhancedAcceptBidTokenData[]
  chain?: ReservoirChain | null
  open?: boolean
}

const StyledImg = styled(Img, {
  width: 24,
  height: 24,
})

export const ApproveCollectionsCollapsible: FC<Props> = ({
  step,
  tokensData,
  chain,
  open,
}) => {
  const [collapsibleOpen, setCollapsibleOpen] = useState(false)
  const isComplete =
    step && step.items?.every((item) => item?.status == 'complete')
      ? true
      : false

  useEffect(() => {
    if (open !== undefined && open !== collapsibleOpen) {
      setCollapsibleOpen(open)
    }
  }, [open])

  const pathMap = useMemo(
    () =>
      tokensData.reduce((paths, tokenData) => {
        tokenData.bidsPath.forEach((bidPath) => {
          if (bidPath.orderId) {
            paths[bidPath.orderId] = bidPath
          }
        })
        return paths
      }, {} as Record<string, EnhancedAcceptBidTokenData['bidsPath'][0]>),
    [tokensData]
  )

  const tokensMap = useMemo(
    () =>
      tokensData.reduce((map, tokenData) => {
        const contract = (tokenData?.collectionId || '').split(':')[0]
        map[`${contract}:${tokenData.tokenId}`] = tokenData
        return map
      }, {} as Record<string, EnhancedAcceptBidTokenData>),
    []
  )

  if (step.id !== 'sale' && step.id !== 'nft-approval') {
    return null
  }

  const title = step.id === 'sale' ? 'Confirm Sale' : 'Approve Collections'
  const disabled = !step.items || !step.items.length

  return (
    <ApproveCollapsible
      title={title}
      open={disabled ? false : collapsibleOpen}
      onOpenChange={disabled ? () => {} : setCollapsibleOpen}
      isComplete={isComplete}
    >
      <Grid
        css={{
          px: '$4',
          pb: '$2',
          gridTemplateColumns: 'auto 1fr 16px',
        }}
      >
        {step?.items?.map((item) => {
          debugger
          const paths = item.orderIds?.map((id) => pathMap[id]) || []
          const marketplaces = Array.from(
            paths.reduce((marketplaces, path) => {
              if (path.source) {
                marketplaces.add(path.source)
              }
              return marketplaces
            }, new Set() as Set<string>)
          ).join(',')
          if (step.id === 'sale') {
            return (
              <>
                <Flex>
                  <StyledImg src="" />
                  <StyledImg src="" />
                </Flex>
                <Text style="body2" color="subtle">
                  Confirm sale of {paths.length}{' '}
                  {paths.length > 0 ? 'items' : 'item'} on{' '}
                  {marketplaces.length > 0 ? marketplaces : 'exchange'}
                </Text>
                <Loader css={{ height: 16 }} />
              </>
            )
          } else {
            const baseApiUrl = chain?.baseApiUrl
            const path = paths.length > 0 ? paths[0] : null
            const tokenKey = `${path?.contract}:${path?.tokenId}`
            const collection = tokensMap[tokenKey]?.tokenData?.token?.collection
            const collectionName = collection?.name || 'Collection'
            const collectionImage =
              collection?.image || baseApiUrl
                ? `${baseApiUrl}/redirect/collections/${path?.contract}/image/v1`
                : ''
            const sourceImages = paths.map(
              (path) => `${baseApiUrl}/redirect/sources/${path.source}/logo/v2`
            )

            return (
              <>
                <Flex>
                  <StyledImg src={collectionImage} />
                  {sourceImages.map((src) => (
                    <StyledImg src={src} css={{ marginLeft: -12 }} />
                  ))}
                </Flex>
                <Text style="body2" color="subtle">
                  Approve {collectionName} for{' '}
                  {marketplaces.length > 0 ? marketplaces : 'trading'}
                </Text>
                <Loader css={{ height: 16 }} />
                <Flex>
                  <StyledImg src={collectionImage} />
                  {sourceImages.map((src) => (
                    <StyledImg src={src} css={{ marginLeft: -12 }} />
                  ))}
                </Flex>
                <Text style="body2" color="subtle">
                  Approve {collectionName} for{' '}
                  {marketplaces.length > 0 ? marketplaces : 'trading'}
                </Text>
                <Loader css={{ height: 16 }} />
                <Flex>
                  <StyledImg src={collectionImage} />
                  {sourceImages.map((src) => (
                    <StyledImg src={src} css={{ marginLeft: -12 }} />
                  ))}
                </Flex>
                <Text style="body2" color="subtle">
                  Approve {collectionName} for{' '}
                  {marketplaces.length > 0 ? marketplaces : 'trading'}
                </Text>
                <Loader css={{ height: 16 }} />
              </>
            )
          }
        })}
      </Grid>
    </ApproveCollapsible>
  )
}
