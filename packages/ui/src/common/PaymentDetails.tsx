import React, { FC, useContext } from 'react'
import { CSS } from '@stitches/react'
import {
  Flex,
  FormatCryptoCurrency,
  FormatCurrency,
  Loader,
  Text,
} from '../primitives'
import { ProviderOptionsContext } from '../ReservoirKitProvider'
import { EnhancedCurrency } from '../hooks/usePaymentTokensv2'
import { formatUnits } from 'viem'

type Props = {
  css?: CSS
  chainId?: number
  paymentCurrency?: EnhancedCurrency
  loading?: boolean
  feeOnTop: bigint
  feeUsd: string
}

export const PaymentDetails: FC<Props> = ({
  css,
  chainId,
  paymentCurrency,
  loading,
  feeOnTop,
  feeUsd,
}) => {
  const providerOptions = useContext(ProviderOptionsContext)
  const usdTotal = formatUnits(
    ((paymentCurrency?.currencyTotalRaw || 0n) + feeOnTop) *
      (paymentCurrency?.usdPriceRaw || 0n),
    (paymentCurrency?.decimals || 18) + 6
  )

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
          {loading ? (
            <Loader />
          ) : (
            <>
              {providerOptions.preferDisplayFiatTotal ? (
                <>
                  <FormatCurrency amount={usdTotal} style="h6" color="base" />
                  <FormatCryptoCurrency
                    chainId={chainId}
                    textStyle="body2"
                    textColor="subtle"
                    amount={
                      (paymentCurrency?.currencyTotalRaw ?? 0n) + feeOnTop
                    }
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
                    amount={
                      (paymentCurrency?.currencyTotalRaw ?? 0n) + feeOnTop
                    }
                    address={paymentCurrency?.address}
                    decimals={paymentCurrency?.decimals}
                    symbol={paymentCurrency?.symbol}
                    logoWidth={18}
                  />
                  <FormatCurrency
                    amount={usdTotal}
                    style="body2"
                    color="subtle"
                  />
                </>
              )}
            </>
          )}
        </Flex>
      </Flex>
    </Flex>
  )
}
