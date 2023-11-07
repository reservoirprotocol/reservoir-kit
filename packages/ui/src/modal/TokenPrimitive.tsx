import { styled } from '../../stitches.config'
import React, { FC, useContext } from 'react'
import {
  Box,
  Flex,
  Text,
  Grid,
  FormatCurrency,
  FormatCryptoCurrency,
  ChainIcon,
  Divider,
} from '../primitives'
import InfoTooltip from '../primitives/InfoTooltip'
import { ReservoirChain } from '@reservoir0x/reservoir-sdk'
import { ProviderOptionsContext } from '../ReservoirKitProvider'

type Props = {
  img?: string
  name?: string
  collection: string
  currencyContract?: string
  currencyDecimals?: number
  currencySymbol?: string
  source?: string
  price?: number
  usdPrice?: number | string
  expires?: string
  warning?: string
  isOffer?: boolean
  isUnavailable?: boolean
  priceSubtitle?: string
  royaltiesBps?: number
  chain?: ReservoirChain | null
  quantity?: number
}

const Img = styled('img', {
  height: 56,
  width: 56,
})

const TokenPrimitive: FC<Props> = ({
  img,
  name,
  chain,
  collection,
  currencyContract,
  currencyDecimals,
  currencySymbol,
  expires,
  warning,
  source,
  usdPrice,
  price,
  isUnavailable,
  priceSubtitle,
  royaltiesBps,
  quantity,
}) => {
  const royaltyPercent = royaltiesBps ? royaltiesBps / 100 : royaltiesBps
  const providerOptions = useContext(ProviderOptionsContext)

  return (
    <Box>
      <Flex css={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Text
          style="subtitle3"
          color="subtle"
          css={{ mb: 10, display: 'block' }}
        >
          {name ? 'Item' : 'Collection'}
        </Text>
        {priceSubtitle && (
          <Text
            style="subtitle3"
            color="subtle"
            css={{ mb: 10, display: 'block' }}
          >
            {priceSubtitle}
          </Text>
        )}
      </Flex>
      <Flex justify="between">
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
            <Flex
              align="center"
              css={{ gap: '$2', mr: '$4', overflow: 'hidden' }}
            >
              <Text
                style="h6"
                ellipsify
                color={isUnavailable ? 'subtle' : 'base'}
              >
                {name ? name : collection}
              </Text>
              {expires && quantity && quantity > 1 && !name ? (
                <Flex>
                  <ChainIcon chainId={chain?.id} height={12} css={{ mr: 5 }} />
                  <Text style="tiny" color="subtle">
                    {chain?.name}
                  </Text>
                </Flex>
              ) : null}
              {expires && quantity && quantity > 1 ? (
                <Flex
                  css={{
                    p: '$1 ',
                    background: '$neutralBgHover',
                    borderRadius: 4,
                    mr: 'auto',
                  }}
                >
                  <Text
                    style="tiny"
                    color="base"
                    css={{ minWidth: 'max-content' }}
                  >
                    {quantity} items
                  </Text>
                </Flex>
              ) : null}
            </Flex>
            {!name && !quantity && expires ? (
              <Flex align="center">
                <ChainIcon chainId={chain?.id} height={12} css={{ mr: 5 }} />
                <Text style="body3" color="subtle">
                  {chain?.name}
                </Text>
              </Flex>
            ) : null}
            {name && (
              <Flex>
                <Text style="body3" color="subtle">
                  {collection}
                </Text>
                <Divider direction="vertical" />
                <ChainIcon chainId={chain?.id} css={{ mr: 5 }} height={12} />
                <Text style="body3" color="subtle">
                  {chain?.name}
                </Text>
              </Flex>
            )}
            {!!expires && (
              <Text style="tiny" color="subtle" css={{ color: '$neutralText' }}>
                Expires {expires}
              </Text>
            )}
            {!expires && quantity && quantity > 1 ? (
              <Flex
                css={{
                  p: '$1 ',
                  background: '$neutralBgHover',
                  borderRadius: 4,
                  mr: 'auto',
                }}
              >
                <Text style="tiny" color="base">
                  {quantity} {quantity > 1 ? 'items' : 'item'}
                </Text>
              </Flex>
            ) : null}
            {!expires && !quantity && royaltiesBps ? (
              <Text
                style="body3"
                color="subtle"
                css={{ display: 'flex', gap: '$1' }}
              >
                Creator Royalties: {royaltyPercent}%
                <InfoTooltip
                  side="right"
                  width={200}
                  content="A fee on every order that goes to the collection creator."
                />
              </Text>
            ) : null}
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
          {providerOptions.switchMainCurrency && usdPrice ? (
            <>
              <FormatCurrency
                amount={usdPrice}
                style="subtitle3"
                color="base"
              />
              {price ? (
                <FormatCryptoCurrency
                  amount={price}
                  chainId={chain?.id}
                  textStyle="tiny"
                  textColor={isUnavailable ? 'subtle' : 'base'}
                  address={currencyContract}
                  decimals={currencyDecimals}
                  symbol={currencySymbol}
                  logoWidth={12}
                />
              ) : (
                <Text
                  style="subtitle3"
                  color={isUnavailable ? 'subtle' : 'base'}
                >
                  --
                </Text>
              )}
            </>
          ) : (
            <>
              {price ? (
                <FormatCryptoCurrency
                  amount={price}
                  chainId={chain?.id}
                  textStyle={'subtitle3'}
                  textColor={isUnavailable ? 'subtle' : 'base'}
                  address={currencyContract}
                  decimals={currencyDecimals}
                  symbol={currencySymbol}
                  logoWidth={14.5}
                />
              ) : (
                <Text
                  style="subtitle3"
                  color={isUnavailable ? 'subtle' : 'base'}
                >
                  --
                </Text>
              )}
              {usdPrice ? (
                <FormatCurrency amount={usdPrice} style="tiny" color="subtle" />
              ) : null}
            </>
          )}
          {warning && (
            <Text style="subtitle3" color="error">
              {warning}
            </Text>
          )}
        </Grid>
      </Flex>
    </Box>
  )
}

export default TokenPrimitive
