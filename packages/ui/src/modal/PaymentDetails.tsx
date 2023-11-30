import React, { FC, useContext } from 'react'
import { CSS } from '@stitches/react'
import { Flex, FormatCryptoCurrency, FormatCurrency, Text } from '../primitives'
import { ProviderOptionsContext } from '../ReservoirKitProvider'
import { EnhancedCurrency } from '../hooks/usePaymentTokens'

type Props = {
  css?: CSS
  chainId?: number
  paymentCurrency?: EnhancedCurrency
  feeOnTop: bigint
  feeUsd: string
}

export const PaymentDetails: FC<Props> = ({
  css,
  chainId,
  paymentCurrency,
  feeOnTop,
  feeUsd,
}) => {
  const providerOptions = useContext(ProviderOptionsContext)

  return (
    <Flex direction="column" css={{ width: '100%', ...css }}>
      {feeOnTop > 0 && (
        <Flex
          justify="between"
          align="start"
          css={{ px: '$4', py: '$3', width: '100%' }}
        >
          <Text style="subtitle3">Referral Fee</Text>
          <Flex direction="column" align="end" css={{ gap: '$1' }}>
            <FormatCryptoCurrency
              chainId={chainId}
              amount={feeOnTop}
              address={paymentCurrency?.address}
              decimals={paymentCurrency?.decimals}
              symbol={paymentCurrency?.name}
            />
            <FormatCurrency amount={feeUsd} color="subtle" style="tiny" />
          </Flex>
        </Flex>
      )}
      <Flex justify="between" align="start" css={{ px: '$4' }}>
        <Text style="h6">You Pay</Text>
        <Flex direction="column" align="end" css={{ gap: '$1' }}>
          {providerOptions.preferDisplayFiatTotal ? (
            <>
              <FormatCurrency
                amount={paymentCurrency?.usdTotalPriceRaw}
                style="h6"
                color="base"
              />
              <FormatCryptoCurrency
                chainId={chainId}
                textStyle="tiny"
                textColor="subtle"
                amount={paymentCurrency?.currencyTotalRaw}
                address={paymentCurrency?.address}
                decimals={paymentCurrency?.decimals}
                symbol={paymentCurrency?.symbol}
                logoWidth={12}
              />
            </>
          ) : (
            <>
              <FormatCryptoCurrency
                chainId={chainId}
                textStyle="h6"
                textColor="base"
                amount={paymentCurrency?.currencyTotalRaw}
                address={paymentCurrency?.address}
                decimals={paymentCurrency?.decimals}
                symbol={paymentCurrency?.symbol}
                logoWidth={18}
              />
              <FormatCurrency
                amount={paymentCurrency?.usdTotalPriceRaw}
                style="body2"
                color="subtle"
              />
            </>
          )}
        </Flex>
      </Flex>
    </Flex>
  )
}
