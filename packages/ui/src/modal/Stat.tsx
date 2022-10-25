import React, { FC, ReactElement } from 'react'
import { Flex, Text, FormatEth, FormatWEth } from '../primitives'

type StatProps = {
  label: string | ReactElement
  value: string | number | null
  asEth?: boolean
  asWeth?: boolean
}

const Stat: FC<StatProps> = ({
  label,
  value,
  asEth = false,
  asWeth = false,
  ...props
}) => (
  <Flex
    align="center"
    justify="between"
    className="rk-stat-well"
    css={{
      backgroundColor: '$wellBackground',
      p: '$2',
      borderRadius: '$borderRadius',
      overflow: 'hidden',
    }}
    {...props}
  >
    <Flex css={{ flex: 1, minWidth: '0', alignItems: 'center', gap: '$2', mr: '$1' }}>
      {label}
    </Flex>
    {asEth && !asWeth && <FormatEth amount={value} textStyle="subtitle2" />}
    {asWeth && !asEth && <FormatWEth amount={value} textStyle="subtitle2" />}
    {!asEth && !asWeth && (
      <Text
        style="subtitle2"
        as="p"
        css={{
          marginLeft: '$2',
        }}
        ellipsify
      >
        {value ? value : '-'}
      </Text>
    )}
  </Flex>
)

Stat.toString = () => '.rk-stat-well'

export default Stat
