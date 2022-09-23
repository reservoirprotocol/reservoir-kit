import { CSSProps, styled } from '../../stitches.config'
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area'
import React from 'react'
import * as styles from './styles/ScrollArea'

const ScrollArea = styled(ScrollAreaPrimitive.Root, styles.root)
type ScrollAreaProps = ScrollAreaPrimitive.ScrollAreaProps & CSSProps

const ScrollAreaViewport = styled(ScrollAreaPrimitive.Viewport, styles.viewport)

const ScrollAreaScrollbar = styled(
  ScrollAreaPrimitive.Scrollbar,
  styles.scrollbar
)

const ScrollAreaThumb = styled(ScrollAreaPrimitive.Thumb, styles.thumb)

const ScrollAreaCorner = styled(ScrollAreaPrimitive.Corner, styles.corner)

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
