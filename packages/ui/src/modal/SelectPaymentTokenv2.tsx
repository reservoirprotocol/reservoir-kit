import React, { FC } from 'react'
import {
  Box,
  Button,
  ChainIcon,
  CryptoCurrencyIcon,
  Flex,
  Text,
} from '../primitives'
import { EnhancedCurrency } from '../hooks/usePaymentTokens'
import { formatUnits, zeroAddress } from 'viem'
import EthIconCircleBlue from '../img/EthIconCircleBlue'
import { formatNumber } from '../lib/numbers'

type Props = {
  paymentTokens: EnhancedCurrency[]
  setCurrency: React.Dispatch<
    React.SetStateAction<EnhancedCurrency | undefined>
  >
  goBack: () => void
  currency?: EnhancedCurrency
  itemAmount: number
  chainId: number
}

const PaymentTokenRow = ({
  setCurrency,
  paymentToken,
  goBack,
  currency,
}: {
  setCurrency: Props['setCurrency']
  paymentToken: EnhancedCurrency
  goBack: Props['goBack']
  currency?: EnhancedCurrency
}) => {
  const isSelectedCurrency =
    currency?.address.toLowerCase() === paymentToken?.address &&
    currency?.chainId === paymentToken?.chainId
  const formattedBalance = formatUnits(
    BigInt(paymentToken?.balance || 0),
    paymentToken?.decimals || 18
  )
  return (
    <Button
      color="ghost"
      size="none"
      css={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        p: '$4',
        background: '$neutralBg',
        borderRadius: 8,
        border: isSelectedCurrency ? '1px solid $accentBorderHover' : 'none',
        '&:hover': {
          background: '$neutralBgHover',
        },
        '&:disabled': {
          background: 'transparent',
          cursor: 'not-allowed',
        },
      }}
      onClick={() => {
        setCurrency(paymentToken)
        goBack()
      }}
    >
      <Flex
        align="center"
        css={{
          gap: '$3',
          width: '100%',
        }}
      >
        {paymentToken?.address === zeroAddress ? (
          <Box
            css={{
              display: 'flex',
              width: 34,
              height: 34,
              'object-fit': 'contain',
              position: 'relative',
            }}
          >
            <EthIconCircleBlue />
            <ChainIcon
              chainId={paymentToken.chainId}
              color={true}
              css={{
                position: 'absolute',
                bottom: -5,
                right: -5,
                width: 20,
                height: 20,
              }}
            />
          </Box>
        ) : (
          <CryptoCurrencyIcon
            address={paymentToken?.address as string}
            css={{ width: 34, height: 34, 'object-fit': 'contain' }}
          />
        )}
        <Text style="subtitle2" css={{ mr: 'auto' }} ellipsify>
          {paymentToken?.name}
        </Text>
        <Text style="subtitle2" color="subtle">
          Balance: {formatNumber(Number(formattedBalance), 6)}
        </Text>
      </Flex>
    </Button>
  )
}

export const SelectPaymentTokenv2: FC<Props> = ({
  paymentTokens,
  setCurrency,
  goBack,
  currency,
  itemAmount,
  chainId,
}) => {
  const availablePaymentTokens = paymentTokens.filter((paymentToken) => {
    const isSelectedCurrency =
      currency?.address.toLowerCase() === paymentToken?.address &&
      currency?.chainId === paymentToken?.chainId
    const hasMaxItemAmount = paymentToken?.maxItems != undefined
    const hasMaxPricePerItem = paymentToken?.maxPricePerItem != undefined
    const hasCurrencyTotalRaw = paymentToken?.currencyTotalRaw != undefined

    const maxPurchasablePrice =
      BigInt(itemAmount) * BigInt(paymentToken?.maxPricePerItem ?? 0)
    const maxItemAmount = paymentToken?.maxItems
      ? BigInt(paymentToken?.maxItems)
      : undefined

    return Boolean(
      isSelectedCurrency ||
        (!hasMaxPricePerItem && !hasMaxItemAmount && hasCurrencyTotalRaw) ||
        (maxPurchasablePrice &&
          paymentToken?.currencyTotalRaw !== undefined &&
          maxPurchasablePrice >= paymentToken?.currencyTotalRaw &&
          maxItemAmount &&
          maxItemAmount >= itemAmount)
    )
  })

  const nativeCurrencies = availablePaymentTokens.filter(
    (token) => token.chainId === chainId
  )
  const crossChainCurrencies = availablePaymentTokens.filter(
    (token) => token.chainId !== chainId
  )

  return (
    <Flex direction="column" css={{ width: '100%', gap: '$3', px: '$3' }}>
      {nativeCurrencies.map((paymentToken, idx) => (
        <PaymentTokenRow
          key={idx}
          currency={currency}
          goBack={goBack}
          setCurrency={setCurrency}
          paymentToken={paymentToken}
        />
      ))}
      {crossChainCurrencies.length > 0 ? (
        <Flex direction="column" align="start" css={{ gap: '$2' }}>
          <Text style="subtitle2" color="subtle">
            CrossChain ETH
          </Text>
          <Text color="accent" style="body3">
            *CrossChain payment is currently limited to a single item.
          </Text>
        </Flex>
      ) : null}
      {crossChainCurrencies.map((paymentToken, idx) => (
        <PaymentTokenRow
          key={idx}
          currency={currency}
          goBack={goBack}
          setCurrency={setCurrency}
          paymentToken={paymentToken}
        />
      ))}
    </Flex>
  )
}
