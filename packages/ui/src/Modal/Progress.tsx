import React, { FC } from 'react'
import { Box } from '../primitives/Box'
import { styled } from '../../stitches.config'

const Img = styled('img', {
  height: 56,
  width: 56,
})

export const Progress: FC = () => {
  return (
    <Box>
      <Img src="" css={{ borderRadius: 4, overflow: 'hidden' }} />
      Progress
    </Box>
  )
}
