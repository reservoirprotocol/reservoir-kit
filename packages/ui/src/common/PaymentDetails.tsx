import React, { FC, useContext } from 'react'
import { CSS } from '@stitches/react'
import {
  Box,
  Flex,
  FormatCryptoCurrency,
  FormatCurrency,
  Loader,
  Text,
  Tooltip,
} from '../primitives'
import { ProviderOptionsContext } from '../ReservoirKitProvider'
import { EnhancedCurrency } from '../hooks/usePaymentTokens'
import { formatUnits } from 'viem'
import { BuyResponses, MintResponses } from '@reservoir0x/reservoir-sdk'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons/faInfoCircle'

type Props = {
  css?: CSS
  chainId?: number
  paymentCurrency?: EnhancedCurrency
  loading?: boolean
  feeOnTop: bigint
  feeUsd: string
  crosschainFees?: BuyResponses['fees'] | MintResponses['fees']
}

export const PaymentDetails: FC<Props> = ({
  css,
  chainId,
  paymentCurrency,
  loading,
  feeOnTop,
  feeUsd,
  crosschainFees,
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
              chainId={paymentCurrency?.chainId ?? chainId}
              amount={feeOnTop}
              address={paymentCurrency?.address}
              decimals={paymentCurrency?.decimals}
              symbol={paymentCurrency?.name}
            />
            <FormatCurrency amount={feeUsd} color="subtle" style="tiny" />
          </Flex>
        </Flex>
      )}
      {crosschainFees && crosschainFees?.relayer?.amount?.raw ? (
        <Flex
          justify="between"
          align="start"
          css={{ px: '$4', py: '$3', width: '100%' }}
        >
          <Flex align="center" css={{ gap: '$2' }}>
            <Text style="subtitle3">Relay Cost</Text>
            <Tooltip
              content={
                <Text
                  style="body3"
                  css={{ maxWidth: 200, textAlign: 'center', display: 'block' }}
                >
                  A fee paid to the Relayer who executes your transaction on the
                  destination chain.
                </Text>
              }
            >
              <Box css={{ color: '$neutralText' }}>
                <FontAwesomeIcon icon={faInfoCircle} />
              </Box>
            </Tooltip>
          </Flex>
          <Flex direction="column" align="end" css={{ gap: '$1' }}>
            <FormatCryptoCurrency
              chainId={paymentCurrency?.chainId ?? chainId}
              amount={crosschainFees?.relayer?.amount?.raw}
            />

            {crosschainFees?.relayer?.amount?.usd ? (
              <FormatCurrency
                amount={crosschainFees?.relayer?.amount?.usd}
                color="subtle"
                style="tiny"
              />
            ) : null}
          </Flex>
        </Flex>
      ) : null}
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
                    chainId={paymentCurrency?.chainId ?? chainId}
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
                    chainId={paymentCurrency?.chainId ?? chainId}
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
