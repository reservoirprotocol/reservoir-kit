import React, { FC } from 'react'
import { Flex, Text } from '../primitives'
import InfoTooltip from './InfoTooltip'

type Props = {
  fees: {
    creatorRoyalties: number
    marketplaceFee: number
    referalFee: number
  }
}

const Fees: FC<Props> = ({
  fees: { creatorRoyalties, marketplaceFee, referalFee },
}) => {
  // Return null when there are no fees
  if (!(creatorRoyalties > 0 || marketplaceFee > 0 || referalFee > 0)) {
    return null
  }
  return (
    <Flex
      css={{
        px: '$4',
        mb: '$2',
        flexDirection: 'column',
      }}
    >
      <Text style="subtitle2" color="subtle" css={{ mb: '$2' }}>
        Fees
      </Text>
      {creatorRoyalties > 0 && (
        <Flex css={{ justifyContent: 'space-between', mb: '$2' }}>
          <Text style="body2">
            Creator Royalties{' '}
            <InfoTooltip side="right" width={200} content={''} />
          </Text>
          <Text style="body2">{creatorRoyalties}%</Text>
        </Flex>
      )}
      {marketplaceFee > 0 && (
        <Flex css={{ justifyContent: 'space-between', mb: '$2' }}>
          <Text style="body2">
            X2Y2 Marketplace Fee{' '}
            <InfoTooltip side="right" width={200} content={''} />
          </Text>
          <Text style="body2">{marketplaceFee}%</Text>
        </Flex>
      )}

      {referalFee > 0 && (
        <Flex css={{ justifyContent: 'space-between', mb: '$2' }}>
          <Text style="body2">
            Referral Fee <InfoTooltip side="right" width={200} content={''} />
          </Text>
          <Text style="body2">{referalFee}%</Text>
        </Flex>
      )}
    </Flex>
  )
}

export default Fees
