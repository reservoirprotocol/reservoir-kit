import React, { FC } from 'react'
import { Flex, Text, FormatEth } from '../../primitives'
import { styled } from '../../../stitches.config'

const Img = styled('img', {
  width: 16,
  height: 16,
})

type Props = {
  label: string
  value: string
  marketImg: string
}

const ListingStat: FC<Props> = ({ label, value, marketImg, ...props }) => (
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
      {label}
    </Text>
  </Flex>
)

ListingStat.toString = () => '.rk-stat-well'

export default ListingStat
