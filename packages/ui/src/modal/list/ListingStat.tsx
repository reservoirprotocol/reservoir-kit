import React, { FC, useEffect, useState } from 'react'
import { Flex, Text, FormatEth } from '../../primitives'
import { styled } from '../../../stitches.config'
import { Listings } from './ListModalRenderer'
import { useTimeSince } from '../../hooks'
import { formatEther } from 'ethers/lib/utils'

const Img = styled('img', {
  width: 16,
  height: 16,
})

type Props = {
  listing: Listings[0]
  marketImg: string
}

const ListingStat: FC<Props> = ({ listing, marketImg, ...props }) => {
  const [value, setValue] = useState('')
  const timeSince = useTimeSince(
    listing.expirationTime ? +listing.expirationTime : 0
  )

  useEffect(() => {
    setValue(formatEther(listing.weiPrice))
  }, [listing])

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
        <FormatEth amount={+value} textStyle="subtitle2" />
        <Img src={marketImg} />
      </Flex>
      <Text style="subtitle2" color="subtle" as="p" css={{ flex: 1 }}>
        {listing.expirationTime ? `Expires ${timeSince}` : 'No Expiration'}
      </Text>
    </Flex>
  )
}

ListingStat.toString = () => '.rk-stat-well'

export default ListingStat
