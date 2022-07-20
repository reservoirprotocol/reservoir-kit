import React from 'react'
import * as Popover from '@radix-ui/react-popover'
import { styled } from '../../stitches.config'
import Box from './Box'

const Arrow = styled(Popover.Arrow, {
  width: 15,
  height: 7,
  fill: '$neutralBgActive',
})

const Content = styled(Popover.Content, {
  filter: 'drop-shadow(0px 2px 16px rgba(0, 0, 0, 0.9))',
  zIndex: 1000,
})

const RKPopover = ({ children, content }: any) => {
  return (
    <Popover.Root>
      <Popover.Trigger>{children}</Popover.Trigger>
      <Content>
        <Arrow />
        <Box
          css={{
            p: '$3',
            maxWidth: 320,
            borderRadius: 8,
            backgroundColor: '$neutralBgActive',
          }}
        >
          {content}
        </Box>
      </Content>
    </Popover.Root>
  )
}

export default RKPopover
