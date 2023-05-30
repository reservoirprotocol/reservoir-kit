import React, { FC } from 'react'
import { styled } from '../../../stitches.config'
import { Flex, FormatCryptoCurrency, Text, Tooltip } from '../../primitives'
import { SellPath } from '@reservoir0x/reservoir-sdk'

type Props = {
  token: {
    name?: string
    id: string
  }
  collection?: {
    name: string
    id: string
  }
  fees?: NonNullable<SellPath>[0]['builtInFees']
  img: string
  sourceImg?: string
  price?: number
  netAmount?: number
  currency?: string
  decimals?: number
}

const Img = styled('img', {
  height: 56,
  width: 56,
})

const AcceptBidLineItem: FC<Props> = ({
  img,
  token,
  collection,
  sourceImg,
  price,
  netAmount,
  fees,
  currency,
  decimals,
}) => {
  const royaltiesBps = fees?.reduce((total, fee) => {
    if (fee?.kind === 'royalty') {
      total += fee?.bps || 0
    }
    return total
  }, 0)

  const isUnavailable = !price

  return (
    <Flex css={{ p: '$4', borderBottom: '1px solid $borderColor', gap: '$2' }}>
      <Img
        src={img}
        alt={'Token Image'}
        css={{
          borderRadius: 4,
          overflow: 'hidden',
          visibility: !img || img.length === 0 ? 'hidden' : 'visible',
          flexShrink: 0,
          objectFit: 'cover',
          filter: isUnavailable ? 'grayscale(1)' : 'unset',
        }}
      />
      <Flex
        direction="column"
        align="start"
        justify="center"
        css={{ gap: 2, mr: 'auto' }}
      >
        <Text style="h6" color={isUnavailable ? 'subtle' : 'base'}>
          {token.name || `#${token.id}`}
        </Text>
        <Text style="body3" color={isUnavailable ? 'subtle' : 'base'}>
          {collection?.name}
        </Text>
        {royaltiesBps ? (
          <Text style="body3" color="subtle">
            Creator Royalties: {royaltiesBps / 100}%
          </Text>
        ) : null}
      </Flex>
      {isUnavailable ? (
        <Text
          color="error"
          style="body3"
          css={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}
        >
          Offer no longer available
        </Text>
      ) : (
        <Tooltip
          side="left"
          content={
            <Flex direction="column" css={{ gap: '$2' }}>
              <Flex css={{ gap: '$1' }} justify="between">
                <Text style="body3">Total Offer Value</Text>
                <FormatCryptoCurrency
                  amount={price}
                  address={currency}
                  decimals={decimals}
                  textStyle="subtitle2"
                />
              </Flex>
              {fees?.map((fee, i) => {
                let feeName = 'Misc Fee'
                switch (fee.kind) {
                  case 'marketplace': {
                    feeName = 'Marketplace Fee'
                    break
                  }
                  case 'royalty': {
                    feeName = 'Creator Royalties'
                    break
                  }
                }
                return (
                  <Flex justify="between" key={i}>
                    <Text style="body3" color="subtle" css={{ mr: '$1' }}>
                      {feeName}
                    </Text>
                    <Text style="body3" color="subtle" css={{ ml: 'auto' }}>
                      -
                    </Text>
                    <FormatCryptoCurrency
                      amount={fee.amount}
                      address={currency}
                      decimals={decimals}
                      textStyle="subtitle2"
                    />
                  </Flex>
                )
              })}
              <Flex justify="between" css={{ gap: '$1' }}>
                <Text style="body3">You Get</Text>
                <FormatCryptoCurrency
                  amount={netAmount}
                  address={currency}
                  decimals={decimals}
                  textStyle="subtitle2"
                />
              </Flex>
            </Flex>
          }
        >
          <Flex
            direction="column"
            align="end"
            justify="center"
            css={{ gap: '$1', ml: 'auto', height: '100%' }}
          >
            {sourceImg && (
              <Img src={sourceImg} css={{ height: 16, width: 16 }} />
            )}
            <FormatCryptoCurrency
              amount={price}
              address={currency}
              decimals={decimals}
              textStyle="subtitle2"
            />
          </Flex>
        </Tooltip>
      )}
    </Flex>
  )
}

export default AcceptBidLineItem
