import React from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import * as Popover from '@radix-ui/react-popover'
import Box from './Box'
import { styled } from '../../stitches.config'
import { useMediaQuery } from '@react-hookz/web'

export const TooltipArrow = styled(TooltipPrimitive.Arrow, {
  fill: '$neutralBgHover',
})

const PopoverArrow = styled(Popover.Arrow, {
  fill: '$neutralBgHover',
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
  const isSmallDevice = useMediaQuery('only screen and (max-width : 768px)')

  if (isSmallDevice) {
    return (
      <Popover.Root
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
      >
        <Popover.Trigger
          style={{
            backgroundColor: 'transparent',
            borderWidth: 0,
            padding: 0,
            display: 'flex',
          }}
        >
          {children}
        </Popover.Trigger>
        <Popover.Content
          sideOffset={2}
          side="bottom"
          align="center"
          style={{ zIndex: 100, outline: 'none' }}
          {...props}
        >
          <PopoverArrow />
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
        </Popover.Content>
      </Popover.Root>
    )
  }
  return (
    <TooltipPrimitive.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      delayDuration={delayDuration}
    >
      <TooltipPrimitive.Trigger
        style={{
          backgroundColor: 'transparent',
          borderWidth: 0,
          padding: 0,
          display: 'flex',
        }}
      >
        {children}
      </TooltipPrimitive.Trigger>
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
  )
}

export default Tooltip
