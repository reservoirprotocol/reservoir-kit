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
  name: string
  collection: string
  currencyContract?: string
  currencyDecimals?: number
  source?: string
  price?: number
  usdPrice?: number | string
  royalty?: number
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
  royalty,
  source,
  usdPrice,
  price,
  isUnavailable,
}) => {
  return (
    <Box>
      <Text style="subtitle2" color="subtle" css={{ mb: 5, display: 'block' }}>
        Item
      </Text>
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
              {name}
            </Text>
            <Text style="body2" color={isUnavailable ? 'subtle' : 'base'}>
              {collection}
            </Text>
            {!!royalty && <Text style="tiny">{royalty}% royalty</Text>}
          </Grid>
        </Flex>
        <Grid css={{ justifyItems: 'end', rowGap: 4 }}>
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
            />
          ) : (
            <Text style="subtitle2" color={isUnavailable ? 'subtle' : 'base'}>
              --
            </Text>
          )}
          {usdPrice && (
            <FormatCurrency amount={usdPrice} style="tiny" color="subtle" />
          )}
        </Grid>
      </Flex>
    </Box>
  )
}

export default TokenPrimitive
