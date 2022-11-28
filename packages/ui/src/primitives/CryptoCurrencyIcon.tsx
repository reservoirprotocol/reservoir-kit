import EthLogo from './EthLogo'
import React, { FC } from 'react'
import { useReservoirClient, useChainCurrency } from '../hooks/index'
import { constants } from 'ethers'
import { styled } from '../../stitches.config'
import { StyledComponent } from '@stitches/react/types/styled-component'
import Box from './Box'
import wrappedContracts from '../constants/wrappedContracts'
import WEthIcon from '../img/WEthIcon'

type Props = {
  address: string
} & Parameters<StyledComponent>['0']

const StyledImg = styled('img', {})

const CryptoCurrencyIcon: FC<Props> = ({
  address = constants.AddressZero,
  css,
}) => {
  const client = useReservoirClient()
  const chainCurrency = useChainCurrency()

  if (chainCurrency.symbol === 'ETH') {
    if (constants.AddressZero === address) {
      return (
        <Box css={{ display: 'flex', ...css }}>
          <EthLogo />
        </Box>
      )
    }
    if (wrappedContracts[chainCurrency.chainId] === address) {
      return (
        <Box css={{ display: 'flex', ...css }}>
          <WEthIcon />
        </Box>
      )
    }
  }

  return (
    <StyledImg
      src={`${client?.apiBase}/redirect/currency/${address}/icon/v1`}
      css={css}
    />
  )
}

export default CryptoCurrencyIcon
