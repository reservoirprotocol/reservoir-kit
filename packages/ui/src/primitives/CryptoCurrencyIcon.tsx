import EthLogo from './EthLogo'
import React, { FC } from 'react'
import { useReservoirClient, useChainCurrency } from '../hooks/index'
import { zeroAddress } from 'viem'
import { styled } from '../../stitches.config'
import { StyledComponent } from '@stitches/react/types/styled-component'
import Box from './Box'
import wrappedContracts from '../constants/wrappedContracts'
import WEthIcon from '../img/WEthIcon'

type Props = {
  address: string
  chainId?: number
} & Parameters<StyledComponent>['0']

const StyledImg = styled('img', {})

const CryptoCurrencyIcon: FC<Props> = ({
  address = zeroAddress,
  chainId,
  css,
}) => {
  const client = useReservoirClient()
  const chainCurrency = useChainCurrency(chainId)
  const chain = client?.chains.find(
    (chain) => chain.id === chainCurrency.chainId
  )

  if (chainCurrency.symbol === 'ETH') {
    if (zeroAddress === address) {
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
      src={`${chain?.baseApiUrl}/redirect/currency/${address}/icon/v1`}
      css={css}
    />
  )
}

export default CryptoCurrencyIcon
