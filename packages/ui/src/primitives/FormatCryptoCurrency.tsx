import FormatCrypto from './FormatCrypto'
import React, { FC, ComponentProps } from 'react'
import { constants } from 'ethers'
import CryptoCurrencyIcon from './CryptoCurrencyIcon'
import { useNetwork } from 'wagmi'
import Tooltip from './Tooltip'
import Anchor from './Anchor'

type FormatCryptoCurrencyProps = {
  logoWidth?: number
  address?: string
  chainId?: number
  symbol?: string
  tooltipEnabled?: boolean
}

type Props = ComponentProps<typeof FormatCrypto> & FormatCryptoCurrencyProps

const FormatCryptoCurrency: FC<Props> = ({
  amount,
  address = constants.AddressZero,
  maximumFractionDigits,
  logoWidth = 14,
  textStyle,
  css,
  textColor,
  decimals,
  chainId,
  symbol,
  tooltipEnabled,
}) => {
  const { chain: activeChain } = useNetwork()
  const blockExplorerBaseUrl =
    activeChain?.blockExplorers?.default?.url || 'https://etherscan.io'

  return (
    <FormatCrypto
      css={css}
      textColor={textColor}
      textStyle={textStyle}
      amount={amount}
      maximumFractionDigits={maximumFractionDigits}
      decimals={decimals}
    >
      {tooltipEnabled && symbol ? (
        <Tooltip
          side="top"
          content={
            <Anchor
              href={`${blockExplorerBaseUrl}/address/${address}`}
              target="_blank"
              weight="medium"
              css={{ fontSize: 14 }}
            >
              {symbol}
            </Anchor>
          }
        >
          <CryptoCurrencyIcon
            css={{ height: logoWidth }}
            address={address}
            chainId={chainId}
          />
        </Tooltip>
      ) : (
        <CryptoCurrencyIcon
          css={{ height: logoWidth }}
          address={address}
          chainId={chainId}
        />
      )}
    </FormatCrypto>
  )
}

export default FormatCryptoCurrency
