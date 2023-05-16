import FormatCrypto from './FormatCrypto'
import React, { FC, ComponentProps } from 'react'
import CryptoCurrencyIcon from './CryptoCurrencyIcon'
import { useNetwork } from 'wagmi'
import Tooltip from './Tooltip'
import Anchor from './Anchor'
import { zeroAddress } from 'viem'

type FormatCryptoCurrencyProps = {
  logoWidth?: number
  address?: string
  chainId?: number
  symbol?: string
}

type Props = ComponentProps<typeof FormatCrypto> & FormatCryptoCurrencyProps

const FormatCryptoCurrency: FC<Props> = ({
  amount,
  address = zeroAddress,
  maximumFractionDigits,
  logoWidth = 14,
  textStyle,
  css,
  textColor,
  decimals,
  chainId,
  symbol,
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
      {symbol ? (
        <Tooltip
          side="top"
          content={
            <Anchor
              href={`${blockExplorerBaseUrl}/address/${address}`}
              target="_blank"
              weight="medium"
              css={{ fontSize: 14 }}
              onClick={(event) => event.stopPropagation()}
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
