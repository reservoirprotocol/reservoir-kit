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
  const img = useMemo(() => {
    if (!tokensData || !tokensData[0]) {
      return
    }
    const baseApiUrl = chain?.baseApiUrl
    const token = tokensData[0]
    const contract = (token?.collectionId || '').split(':')[0]
    const tokenId = `${contract}:${token?.tokenId}`
    return token?.tokenData?.token?.image || baseApiUrl
      ? `${baseApiUrl}/redirect/tokens/${tokenId}/image/v1`
      : ''
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
  const usdPrice = 100.5

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
        <Flex>
          <Img
            src={img}
            alt={'Token Image'}
            css={{
              visibility: !img || img.length === 0 ? 'hidden' : 'visible',
            }}
          />
          {itemCount > 1 ? (
            <Img
              src={img}
              alt={'Token Image'}
              css={{
                visibility: !img || img.length === 0 ? 'hidden' : 'visible',
                ml: '-40%',
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
          align="center"
          justify="end"
          direction="column"
          css={{ ml: 'auto' }}
        >
          <Flex>
            {prices.map(({ netAmount, currency }, i) => {
              return (
                <>
                  {i > 0 ? (
                    <Text color="subtle" style="subtitle2">
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
                </>
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
