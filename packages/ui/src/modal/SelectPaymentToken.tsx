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
    <Flex direction="column" css={{ width: '100%', gap: '$1', px: '$2' }}>
      {paymentTokens.map((paymentToken) => {
        const isSelectedCurrency = currency?.address === paymentToken?.address
        const formattedBalance = formatUnits(
          BigInt(paymentToken?.balance || 0),
          paymentToken?.decimals || 18
        )
        return (
          <Flex
            key={paymentToken?.address}
            align="center"
            justify="between"
            css={{
              width: '100%',
              p: '$2',
              borderRadius: 4,
              cursor: 'pointer',
              '&:hover': {
                background: '$neutralBgHover',
              },
            }}
            onClick={() => setCurrency(paymentToken)}
          >
            <Flex
              align="center"
              css={{ gap: '$3', opacity: isSelectedCurrency ? 0.5 : 1 }}
            >
              <CryptoCurrencyIcon
                address={paymentToken?.address as string}
                css={{ width: 24, height: 24 }}
              />
              <Flex direction="column" css={{ gap: '$1' }}>
                <Text style="subtitle2">{paymentToken?.name}</Text>
                <Text style="body2" color="subtle">
                  Balance: {formattedBalance}
                </Text>
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
