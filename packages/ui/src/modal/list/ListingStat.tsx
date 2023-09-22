import React, { FC } from 'react'
import { Flex, Text, FormatCryptoCurrency } from '../../primitives'
import { styled } from '../../../stitches.config'
import { Listings } from './ListModalRenderer'
import { useTimeSince } from '../../hooks'
import { Currency } from '../../types/Currency'

const Img = styled('img', {
  width: 16,
  height: 16,
})

type Props = {
  listing: Listings[0]
  marketImg: string
  currency: Currency
  chainId?: number
}

const ListingStat: FC<Props> = ({
  listing,
  chainId,
  marketImg,
  currency,
  ...props
}) => {
  const timeSince = useTimeSince(
    listing.expirationTime ? +listing.expirationTime : 0
  )

  return (
    <Flex
      direction="column"
      className="rk-stat-well"
      css={{
        backgroundColor: '$wellBackground',
        p: '$2',
        borderRadius: '$borderRadius',
        gap: '$1',
      }}
      {...props}
    >
      <Flex justify="between">
        <FormatCryptoCurrency
          chainId={chainId}
          amount={listing.weiPrice}
          textStyle="subtitle3"
          address={currency.contract}
          decimals={currency.decimals}
          symbol={currency?.symbol}
        />
        <Img src={marketImg} />
      </Flex>
      <Text style="subtitle3" color="subtle" as="p" css={{ flex: 1 }}>
        {listing.expirationTime ? `Expires ${timeSince}` : 'No Expiration'}
      </Text>
    </Flex>
  )
}

ListingStat.toString = () => '.rk-stat-well'

export default ListingStat
