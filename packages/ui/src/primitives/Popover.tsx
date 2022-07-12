import React from 'react'
import * as RadixPopover from '@radix-ui/react-popover'
import { styled } from '../../stitches.config'
import Box from './Box'

const Arrow = styled(RadixPopover.Arrow, {
  width: 15,
  height: 7,
  fill: '$slate5',
})

const Content = styled(RadixPopover.Content, {
  filter: 'drop-shadow(0px 2px 16px rgba(0, 0, 0, 0.9))',
})

const Popover = ({ children, content }: any) => {
  return (
    <RadixPopover.Root>
      <RadixPopover.Trigger>{children}</RadixPopover.Trigger>
      <Content>
        <Arrow />
        <Box
          css={{
            p: '$3',
            maxWidth: 320,
            borderRadius: 8,
            backgroundColor: '$slate5',
          }}
        >
          {content}
        </Box>
      </Content>
    </RadixPopover.Root>
  )
}

export default Popover
