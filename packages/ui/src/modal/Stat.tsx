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
    className="rk-stat-well"
    css={{
      backgroundColor: '$wellBackground',
      p: '$2',
      borderRadius: '$borderRadius',
      overflow: 'hidden',
    }}
    {...props}
  >
    <Text style="subtitle2" color="subtle" css={{ flex: 1 }}>
      {label}
    </Text>
    {asEth && !asWeth && <FormatEth amount={value} textStyle="subtitle2" />}
    {asWeth && !asEth && <FormatWEth amount={value} textStyle="subtitle2" />}
    {!asEth && !asWeth && (
      <Text
        style="subtitle2"
        as="p"
        css={{
          marginLeft: 8,
          maxWidth: 180,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {value ? value : '-'}
      </Text>
    )}
  </Flex>
)

Stat.toString = () => '.rk-stat-well'

export default Stat
