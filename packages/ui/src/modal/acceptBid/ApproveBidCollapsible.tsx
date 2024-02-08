import React, { FC, useEffect, useMemo, useState } from 'react'
import { Execute, ReservoirChain } from '@reservoir0x/reservoir-sdk'
import { ApproveCollapsible } from '../ApproveCollapisble'
import { EnhancedAcceptBidTokenData } from './AcceptBidModalRenderer'
import { Flex, Grid, Img, Loader, Text } from '../../primitives'
import { styled } from '@stitches/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'

type Props = {
  step: NonNullable<Execute['steps'][0]>
  tokensData: EnhancedAcceptBidTokenData[]
  chain?: ReservoirChain | null
  open?: boolean
  isCurrentStep?: boolean
}

const StyledImg = styled(Img, {
  width: 24,
  height: 24,
  borderRadius: 4,
})

const Spinner = () => (
  <Loader
    css={{ display: 'flex', alignItems: 'center' }}
    icon={
      <Flex css={{ color: '$accentSolidHover' }}>
        <FontAwesomeIcon icon={faCircleNotch} width={16} height={16} />
      </Flex>
    }
  />
)

export const ApproveBidCollapsible: FC<Props> = ({
  step,
  tokensData,
  chain,
  open,
  isCurrentStep,
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
  const baseApiUrl = chain?.baseApiUrl

  return (
    <ApproveCollapsible
      title={title}
      open={disabled ? false : collapsibleOpen}
      onOpenChange={disabled ? () => {} : setCollapsibleOpen}
      isInProgress={isCurrentStep}
      isComplete={isComplete}
      css={{ margin: 12 }}
    >
      <Grid
        css={{
          px: '$4',
          pb: '$2',
          gridTemplateColumns: 'auto 1fr 16px',
          gridRowGap: 24,
        }}
      >
        {step?.items?.map((item, i) => {
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
            const images = paths.reduce((images, path) => {
              const tokenKey = `${path?.contract}:${path?.tokenId}`
              const tokenData = tokensMap[tokenKey]?.tokenData
              const image =
                tokenData?.token?.imageSmall || baseApiUrl
                  ? `${baseApiUrl}/redirect/tokens/${tokenKey}/image/v1?imageSize=small`
                  : null
              if (image && images.length < 4) {
                images.push(image)
              }
              return images
            }, [] as string[])

            return (
              <React.Fragment key={i}>
                <Flex css={{ mr: '$2' }}>
                  {images.map((image, i) => (
                    <StyledImg
                      key={i}
                      src={image}
                      css={{ marginLeft: i > 0 ? -14 : 0 }}
                    />
                  ))}
                </Flex>
                <Text
                  style="body2"
                  color="subtle"
                  css={{ display: 'flex', alignItems: 'center' }}
                >
                  Confirm sale of {paths.length}{' '}
                  {paths.length > 1 ? 'items' : 'item'} on{' '}
                  {marketplaces.length > 0 ? marketplaces : 'exchange'}
                </Text>
                {isCurrentStep ? <Spinner /> : null}
              </React.Fragment>
            )
          } else {
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
              <React.Fragment key={i}>
                <Flex css={{ mr: '$2' }}>
                  <StyledImg src={collectionImage} />
                  {sourceImages.map((src, i) => (
                    <StyledImg key={i} src={src} css={{ marginLeft: -14 }} />
                  ))}
                </Flex>
                <Text
                  style="body2"
                  color="subtle"
                  css={{ display: 'flex', alignItems: 'center' }}
                >
                  Approve {collectionName} for{' '}
                  {marketplaces.length > 0 ? marketplaces : 'trading'}
                </Text>
                {isCurrentStep ? <Spinner /> : null}
              </React.Fragment>
            )
          }
        })}
      </Grid>
    </ApproveCollapsible>
  )
}
