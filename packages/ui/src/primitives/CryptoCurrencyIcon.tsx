import { EthLogo } from './FormatEth'
import React, { FC } from 'react'
import { useReservoirClient } from '../hooks/index'
import { constants } from 'ethers'
import { styled } from '../../stitches.config'
import { StyledComponent } from '@stitches/react/types/styled-component'
import Box from './Box'

type Props = {
  address: string
} & Parameters<StyledComponent>['0']

const StyledImg = styled('img', {})

const CryptoCurrencyIcon: FC<Props> = ({
  address = constants.AddressZero,
  css,
}) => {
  const client = useReservoirClient()

  if (constants.AddressZero === address) {
    return (
      <Box css={{ display: 'flex', ...css }}>
        <EthLogo />
      </Box>
    )
  }

  return (
    <StyledImg
      src={`${client?.apiBase}/redirect/currency/${address}/icon/v1`}
      css={css}
    />
  )
}

export default CryptoCurrencyIcon
