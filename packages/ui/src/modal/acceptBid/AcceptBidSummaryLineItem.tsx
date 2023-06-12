import React, { FC, useMemo } from 'react'
import { styled } from '../../../stitches.config'
import {
  Flex,
  FormatCryptoCurrency,
  FormatCurrency,
  Text,
} from '../../primitives'
import { ReservoirChain } from '@reservoir0x/reservoir-sdk'
import {
  AcceptBidPrice,
  EnhancedAcceptBidTokenData,
} from './AcceptBidModalRenderer'
import { useCoinConversion } from '../../hooks'

type Props = {
  tokensData: EnhancedAcceptBidTokenData[]
  prices: AcceptBidPrice[]
  usdPrices: Record<string, ReturnType<typeof useCoinConversion>[0]>
  chain?: ReservoirChain | null
}

const Img = styled('img', {
  height: 56,
  width: 56,
  borderRadius: 4,
  overflow: 'hidden',
  flexShrink: 0,
  objectFit: 'cover',
})

const AcceptBidSummaryLineItem: FC<Props> = ({
  tokensData,
  prices,
  usdPrices,
  chain,
}) => {
  const imgs = useMemo(() => {
    if (!tokensData || tokensData.length <= 0) {
      return []
    }
    const imgs: string[] = []
    const baseApiUrl = chain?.baseApiUrl
    for (var i = 0; i < tokensData.length; i++) {
      const token = tokensData[i]
      const contract = (token?.collectionId || '').split(':')[0]
      const tokenId = `${contract}:${token?.tokenId}`
      if (token?.tokenData?.token?.imageSmall || baseApiUrl) {
        imgs.push(
          `${baseApiUrl}/redirect/tokens/${tokenId}/image/v1?imageSize=small`
        )
      }
      if (imgs.length > 2) {
        break
      }
    }
    return imgs
  }, [tokensData, chain])

  const itemCount = useMemo(
    () =>
      tokensData.reduce((total, tokenData) => {
        tokenData.bidsPath.forEach((path) => {
          total += path.quantity || 0
        })
        return total
      }, 0),
    [tokensData]
  )
  const usdPrice = useMemo(() => {
    let missingConversion = false
    const totalUsd = prices.reduce((total, { amount, currency }) => {
      const conversion = usdPrices[currency.symbol]
      if (conversion) {
        total += conversion.price * amount
      } else {
        missingConversion = true
      }
      return total
    }, 0)
    return missingConversion ? 0 : totalUsd
  }, [prices, usdPrices])

  return (
    <Flex
      direction="column"
      css={{ p: '$4', borderBottom: '1px solid $borderColor', gap: '$2' }}
    >
      <Flex justify="between">
        <Text color="subtle" style="subtitle2">
          Item
        </Text>
        <Text color="subtle" style="subtitle2">
          You Get
        </Text>
      </Flex>
      <Flex align="center">
        <Flex css={{ mr: '$4', position: 'relative' }}>
          <Img
            src={imgs[0]}
            alt={'Token Image'}
            css={{
              visibility: !imgs[0] ? 'hidden' : 'visible',
              mr: itemCount > 1 && imgs[1] ? 8 : 0,
            }}
          />
          {itemCount > 1 && imgs[1] ? (
            <Img
              src={imgs[1]}
              alt={'Token Image'}
              css={{
                position: 'absolute',
                right: -5,
                zIndex: -1,
                opacity: 0.5,
              }}
            />
          ) : null}
        </Flex>
        <Text style="h6">
          {itemCount} {itemCount > 1 ? 'Items' : 'Item'}
        </Text>

        <Flex
          align="end"
          justify="end"
          direction="column"
          css={{ ml: 'auto', gap: '$2' }}
        >
          <Flex align="center">
            {prices.map(({ netAmount, currency }, i) => {
              return (
                <span key={i}>
                  {i > 0 ? (
                    <Text color="subtle" style="subtitle2" css={{ mx: '$1' }}>
                      +
                    </Text>
                  ) : null}
                  <FormatCryptoCurrency
                    amount={netAmount}
                    address={currency.contract}
                    decimals={currency.decimals}
                    textStyle="h6"
                    logoWidth={19}
                  />
                </span>
              )
            })}
          </Flex>
          <FormatCurrency amount={usdPrice} style="tiny" color="subtle" />
        </Flex>
      </Flex>
    </Flex>
  )
}

export default AcceptBidSummaryLineItem
