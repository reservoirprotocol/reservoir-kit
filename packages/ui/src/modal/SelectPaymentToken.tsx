import React, { FC } from 'react'
import { Box, CryptoCurrencyIcon, Flex, Text } from '../primitives'
import { EnhancedCurrency } from '../hooks/usePaymentTokens'
import { formatUnits } from 'viem'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons'

type Props = {
  paymentTokens: EnhancedCurrency[]
  setCurrency: React.Dispatch<React.SetStateAction<EnhancedCurrency>>
  currency: EnhancedCurrency
}

export const SelectPaymentToken: FC<Props> = ({
  paymentTokens,
  setCurrency,
  currency,
}) => {
  return (
    <Flex direction="column" css={{ width: '100%', gap: '$5' }}>
      {paymentTokens.map((paymentToken) => {
        const isSelectedCurrency = currency?.address === paymentToken?.address
        const formattedBalance = formatUnits(
          BigInt(paymentToken?.balance || 0),
          paymentToken?.decimals || 18
        )
        return (
          <Flex align="center" justify="between" css={{ width: '100%' }}>
            <Flex css={{ gap: '$3' }}>
              <CryptoCurrencyIcon
                address={paymentToken?.address as string}
                css={{ width: 24 }}
              />
              <Flex direction="column">
                <Text style="subtitle2">{paymentToken?.name}</Text>
                <Text>Balance: {formattedBalance}</Text>
              </Flex>
            </Flex>
            <Flex align="center" css={{ gap: '$3' }}>
              {/* @TODO: calculate total in currency */}
              {/* <Text>{currency?.}</Text> */}
              {isSelectedCurrency ? (
                <Box css={{ color: '$accentSolidHover' }}>
                  <FontAwesomeIcon icon={faCheck} width={14} />
                </Box>
              ) : null}
            </Flex>
          </Flex>
        )
      })}
    </Flex>
  )
}
