import React, { FC, ReactElement } from 'react'
import { Flex, Text, FormatEth } from '../../primitives'

type StatProps = {
  label: string | ReactElement
  value: string | number
  asEth?: boolean
}

const Stat: FC<StatProps> = ({ label, value, asEth = false, ...props }) => (
  <Flex
    align="center"
    className="rk-stat-well"
    css={{
      backgroundColor: '$wellBackground',
      p: '$2',
      borderRadius: '$borderRadius',
    }}
    {...props}
  >
    <Text style="subtitle2" color="subtle" css={{ flex: 1 }}>
      {label}
    </Text>
    {asEth ? (
      <FormatEth amount={value} textStyle="subtitle2" />
    ) : (
      <Text style="subtitle2" as="p">
        {value}
      </Text>
    )}
  </Flex>
)

Stat.toString = () => '.rk-stat-well'

export default Stat
