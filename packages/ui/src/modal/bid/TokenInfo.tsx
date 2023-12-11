import { useTokens, useCollections, useTimeSince } from '../../hooks'
import React, { FC } from 'react'
import {
  ChainIcon,
  Divider,
  Flex,
  FormatCryptoCurrency,
  Img,
  Text,
} from '../../primitives'
import { ReservoirChain } from '@reservoir0x/reservoir-sdk'
import { Currency } from '../../types/Currency'
import { ExpirationOption } from '../../types/ExpirationOption'
import { CSS } from '@stitches/react'

type Props = {
  token?: NonNullable<NonNullable<ReturnType<typeof useTokens>>['data']>['0']
  collection: NonNullable<ReturnType<typeof useCollections>['data']>[0]
  chain?: ReservoirChain | null
  price?: string
  currency?: Currency
  quantity?: number
  expirationOption?: ExpirationOption
  containerCss?: CSS
}

const TokenInfo: FC<Props> = ({
  token,
  collection,
  chain,
  price,
  currency,
  quantity,
  expirationOption,
  containerCss,
}) => {
  const expirationDisplay =
    expirationOption?.value === 'custom' && expirationOption.relativeTime
      ? useTimeSince(expirationOption.relativeTime)
      : `in ${expirationOption?.text.toLowerCase()}`

  const floorAsk = token?.market?.floorAsk ?? collection?.floorAsk
  const topBid = token?.market?.topBid ?? collection?.topBid

  return (
    <Flex
      align="center"
      justify="between"
      css={{ p: '$4', gap: '$4', ...containerCss }}
    >
      <Flex align="center" css={{ gap: '$3', overflow: 'hidden' }}>
        <Img
          src={token?.token?.imageSmall || collection?.image}
          alt={token?.token?.name || collection?.name}
          css={{ width: 56, height: 56, borderRadius: 4, aspectRatio: '1/1' }}
        />
        <Flex direction="column" css={{ gap: '$1', overflow: 'hidden' }}>
          <Text style="h6" ellipsify>
            {token?.token?.tokenId
              ? `#${token?.token?.tokenId}`
              : token?.token?.name}
          </Text>
          <Flex align="center" css={{ gap: '$1' }}>
            <Text style="subtitle2" color="subtle" ellipsify>
              {collection?.name}
            </Text>
            {chain && !expirationOption ? (
              <>
                <Divider direction="vertical" />
                <ChainIcon chainId={chain.id} height={12} />
                <Text style="subtitle2" color="subtle" ellipsify>
                  {chain.name}
                </Text>
              </>
            ) : null}
          </Flex>
          {quantity && quantity > 1 ? (
            <Flex
              css={{
                width: 'max-content',
                backgroundColor: '$neutralBg',
                borderRadius: 4,
                py: '$1',
                px: '$2',
              }}
            >
              <Text style="body3" color="subtle" ellipsify>
                {quantity} items
              </Text>
            </Flex>
          ) : null}
        </Flex>
      </Flex>

      {!price ? (
        <Flex align="center" css={{ gap: '$2', flexShrink: 0 }}>
          {floorAsk?.price ? (
            <Flex>
              <Text style="subtitle2" color="subtle">
                Floor Price
              </Text>
              <FormatCryptoCurrency
                amount={floorAsk?.price?.amount?.decimal}
                address={floorAsk?.price?.currency?.contract}
                symbol={floorAsk?.price?.currency?.symbol}
                decimals={floorAsk?.price?.currency?.decimals}
                textStyle="subtitle2"
              />
            </Flex>
          ) : null}
          {floorAsk?.price && topBid?.price ? <Divider /> : null}
          {topBid?.price ? (
            <Flex>
              <Text style="subtitle2" color="subtle">
                Best Offer
              </Text>
              <FormatCryptoCurrency
                amount={topBid?.price?.amount?.decimal}
                address={topBid?.price?.currency?.contract}
                symbol={topBid?.price?.currency?.symbol}
                decimals={topBid?.price?.currency?.decimals}
                textStyle="subtitle2"
              />
            </Flex>
          ) : null}
        </Flex>
      ) : (
        <Flex direction="column" align="end" css={{ gap: '$1', flexShrink: 0 }}>
          {price && currency ? (
            <FormatCryptoCurrency
              amount={Number(price)}
              address={currency?.contract}
              symbol={currency?.symbol}
              textStyle="h6"
            />
          ) : null}
          {expirationOption ? (
            <Text style="body2" color="subtle">
              Expires {expirationDisplay}
            </Text>
          ) : null}
        </Flex>
      )}
    </Flex>
  )
}

export default TokenInfo
