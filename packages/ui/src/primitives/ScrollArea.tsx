import { CSSProps, styled } from '../../stitches.config'
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area'
import React from 'react'

const SCROLLBAR_SIZE = 10

const ScrollArea = styled(ScrollAreaPrimitive.Root, {
  height: 322,
  borderRadius: '$space$2',
  overflow: 'hidden',
  boxShadow: `0 2px 10px $inputBackground`,
})
type ScrollAreaProps = ScrollAreaPrimitive.ScrollAreaProps & CSSProps

const ScrollAreaViewport = styled(ScrollAreaPrimitive.Viewport, {
  backgroundColor: 'transparent',
  width: '100%',
  height: '100%',
  borderRadius: 'inherit',
})

const ScrollAreaScrollbar = styled(ScrollAreaPrimitive.Scrollbar, {
  display: 'flex',
  // ensures no selection
  userSelect: 'none',
  // disable browser handling of all panning and zooming gestures on touch devices
  touchAction: 'none',
  padding: 2,
  background: '$inputBackground',
  transition: 'background 160ms ease-out',
  '&:hover': { background: '$inputBackground' },
  '&[data-orientation="vertical"]': { width: SCROLLBAR_SIZE },
  '&[data-orientation="horizontal"]': {
    flexDirection: 'column',
    height: SCROLLBAR_SIZE,
  },
})

const ScrollAreaThumb = styled(ScrollAreaPrimitive.Thumb, {
  flex: 1,
  background: '$wellBackground',
  borderRadius: SCROLLBAR_SIZE,
  // increase target size for touch devices https://www.w3.org/WAI/WCAG21/Understanding/target-size.html
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '100%',
    height: '100%',
    minWidth: 44,
    minHeight: 44,
  },
})

const ScrollAreaCorner = styled(ScrollAreaPrimitive.Corner, {
  background: '$wellBackground',
})

const RKScrollArea = ({ children, ...props }: ScrollAreaProps) => {
  return (
    <ScrollArea {...props}>
      <ScrollAreaViewport>{children}</ScrollAreaViewport>
      <ScrollAreaScrollbar orientation="vertical">
        <ScrollAreaThumb />
      </ScrollAreaScrollbar>
      <ScrollAreaScrollbar orientation="horizontal">
        <ScrollAreaThumb />
      </ScrollAreaScrollbar>
      <ScrollAreaCorner />
    </ScrollArea>
  )
}

RKScrollArea.Root = ScrollArea
RKScrollArea.Viewport = ScrollAreaViewport
RKScrollArea.Scrollbar = ScrollAreaScrollbar
RKScrollArea.Thumb = ScrollAreaThumb
RKScrollArea.Corner = ScrollAreaCorner

export default RKScrollArea
