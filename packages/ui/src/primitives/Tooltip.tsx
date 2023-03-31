import React from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import Box from './Box'
import { styled } from '../../stitches.config'

export const TooltipArrow = styled(TooltipPrimitive.Arrow, {
  fill: '$neutralBgSubtle',
})

const Tooltip = ({
  children,
  content,
  open,
  defaultOpen,
  onOpenChange,
  delayDuration = 0,
  ...props
}: any) => {
  return (
    <TooltipPrimitive.Provider>
      <TooltipPrimitive.Root
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
        delayDuration={delayDuration}
      >
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Content
          sideOffset={2}
          side="bottom"
          align="center"
          style={{ zIndex: 100 }}
          {...props}
        >
          <TooltipArrow />
          <Box
            css={{
              zIndex: 9999,
              $$shadowColor: '$colors$gray7',
              boxShadow: '0px 1px 5px rgba(0,0,0,0.2)',
              borderRadius: 8,
              overflow: 'hidden',
            }}
          >
            <Box
              css={{
                background: '$neutralBgHover',
                p: '$2',
              }}
            >
              {content}
            </Box>
          </Box>
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}

export default Tooltip
