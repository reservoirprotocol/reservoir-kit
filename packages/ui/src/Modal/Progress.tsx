import React, { FC } from 'react'
import { Box } from '../primitives/Box'
import { styled } from '../../stitches.config'
import { Text } from '../primitives/Text'
import { Flex } from '../primitives/Flex'

const Img = styled('img', {
  height: 80,
  width: 80,
})

export const Progress: FC = () => {
  return (
    <Flex
      direction="column"
      css={{
        backgroundColor: '$slate3',
        px: '$5',
        py: '$4',
        alignItems: 'center',
        gap: '$4',
      }}
    >
      <Text style="h6">Confirm Transaction with MetaMask</Text>
      <Img
        src="https://cdn.dribbble.com/users/2574702/screenshots/6702374/metamask.gif"
        css={{ borderRadius: 4, overflow: 'hidden' }}
      />
    </Flex>
  )
}
