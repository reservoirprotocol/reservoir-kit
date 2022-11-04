import React, { FC } from 'react'
import { Flex, Text } from '../../primitives'
import InfoTooltip from '../InfoTooltip'

type Props = {
  fees: {
    feeBreakdown?: {
      kind?: string | undefined
      recipient?: string | undefined
      bps?: number | undefined
    }[]
  }
  marketplace: string
}

const Fees: FC<Props> = ({ fees: { feeBreakdown }, marketplace }) => {
  // Return null when there are no fees
  if (!(feeBreakdown && feeBreakdown?.length > 0)) {
    return null
  }

  const parsedFeeBreakdown = feeBreakdown?.map(({ bps, kind }) => {
    const percentage = bps ? bps * 0.01 : 0
    let name: string = ''
    let tooltipMessage: string | null = null
    switch (kind) {
      case 'royalty':
        name = 'Creator Royalties'
        tooltipMessage =
          'A fee on every order that goes to the collection creator.'
        break

      case 'marketplace':
        name = `${marketplace} Fee`
        tooltipMessage =
          'A fee included in the order from the marketplace in which it was created.'
        break

      default:
        name = 'Misc. Fees'
        break
    }

    return {
      name,
      percentage,
      tooltipMessage,
    }
  })

  return (
    <Flex
      css={{
        px: '$4',
        mt: '$4',
        flexDirection: 'column',
      }}
    >
      <Text style="subtitle2" color="subtle" css={{ mb: '$2' }}>
        Fees
      </Text>
      {parsedFeeBreakdown?.map(({ name, percentage, tooltipMessage }, i) => (
        <Flex key={i} css={{ justifyContent: 'space-between', mb: '$2' }}>
          <Flex css={{ alignItems: 'center', gap: 8 }}>
            <Text style="subtitle2" color="subtle">
              {name}
            </Text>
            {tooltipMessage && (
              <InfoTooltip side="right" width={200} content={tooltipMessage} />
            )}
          </Flex>
          <Text style="subtitle2">{percentage}%</Text>
        </Flex>
      ))}
    </Flex>
  )
}

export default Fees
