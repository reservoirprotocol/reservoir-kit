import { styled } from '../../stitches.config'
import React, { FC } from 'react'
import {
  Box,
  Flex,
  Text,
  Grid,
  FormatCurrency,
  FormatCryptoCurrency,
} from '../primitives'

type Props = {
  img?: string
  name?: string
  collection: string
  currencyContract?: string
  currencyDecimals?: number
  source?: string
  price?: number
  usdPrice?: number | string
  expires?: string
  warning?: string
  isOffer?: boolean
  isUnavailable?: boolean
}

const Img = styled('img', {
  height: 56,
  width: 56,
})

const TokenPrimitive: FC<Props> = ({
  img,
  name,
  collection,
  currencyContract,
  currencyDecimals,
  expires,
  warning,
  isOffer,
  source,
  usdPrice,
  price,
  isUnavailable,
}) => {
  return (
    <Box>
      <Flex css={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Text
          style="subtitle2"
          color="subtle"
          css={{ mb: 10, display: 'block' }}
        >
          {name ? 'Item' : 'Collection'}
        </Text>
        {isOffer && (
          <Text
            style="subtitle2"
            color="subtle"
            css={{ mb: 10, display: 'block' }}
          >
            Offer
          </Text>
        )}
      </Flex>
      <Flex css={{ justifyContent: 'space-between' }}>
        <Flex css={{ alignItems: 'center', gap: 8 }}>
          <Img
            src={img}
            alt={name}
            css={{
              borderRadius: 4,
              overflow: 'hidden',
              visibility: !img || img.length === 0 ? 'hidden' : 'visible',
              flexShrink: 0,
              objectFit: 'cover',
            }}
          />
          <Grid css={{ rowGap: 2 }}>
            <Text
              style="h6"
              ellipsify
              color={isUnavailable ? 'subtle' : 'base'}
            >
              {name ? name : collection}
            </Text>
            {name && (
              <Text style="body2" color={isUnavailable ? 'subtle' : 'base'}>
                {collection}
              </Text>
            )}
            {!!expires && <Text style="tiny">Expires {expires}</Text>}
          </Grid>
        </Flex>
        <Grid css={{ justifyItems: 'end', alignContent: 'start', rowGap: 4 }}>
          {source && (
            <Img
              src={source}
              alt="Source Icon"
              css={{ w: 17, h: 17, borderRadius: 99999, overflow: 'hidden' }}
            />
          )}
          {price ? (
            <FormatCryptoCurrency
              amount={price}
              textColor={isUnavailable ? 'subtle' : 'base'}
              address={currencyContract}
              decimals={currencyDecimals}
              logoWidth={14.5}
            />
          ) : (
            <Text style="subtitle2" color={isUnavailable ? 'subtle' : 'base'}>
              --
            </Text>
          )}
          {usdPrice ? (
            <FormatCurrency amount={usdPrice} style="tiny" color="subtle" />
          ) : null}
          {warning && (
            <Text style="subtitle2" color="error">
              {warning}
            </Text>
          )}
        </Grid>
      </Flex>
    </Box>
  )
}

export default TokenPrimitive
