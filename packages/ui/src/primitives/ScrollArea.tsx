import { CSSProps, styled } from '../../stitches.config'
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area'
import React, { FC } from 'react'
import * as styles from './styles/ScrollArea'

const ScrollArea = styled(ScrollAreaPrimitive.Root, styles.root)
type ScrollAreaProps = ScrollAreaPrimitive.ScrollAreaProps & CSSProps

const ScrollAreaViewport = styled(ScrollAreaPrimitive.Viewport, styles.viewport)
type ScrollAreaViewportProps = ScrollAreaPrimitive.ScrollAreaViewportProps &
  CSSProps

const ScrollAreaScrollbar = styled(
  ScrollAreaPrimitive.Scrollbar,
  styles.scrollbar
)
type ScrollAreaScrollbarProps = ScrollAreaPrimitive.ScrollAreaScrollbarProps &
  CSSProps

const ScrollAreaThumb = styled(ScrollAreaPrimitive.Thumb, styles.thumb)
type ScrollAreaThumbProps = ScrollAreaPrimitive.ScrollAreaThumbProps & CSSProps

const ScrollAreaCorner = styled(ScrollAreaPrimitive.Corner, styles.corner)
type ScrollAreaCornerProps = ScrollAreaPrimitive.ScrollAreaCornerProps &
  CSSProps

type GeneralizedScrollAreaProps = {
  viewportProps?: ScrollAreaViewportProps
  scrollbarProps?: ScrollAreaScrollbarProps
  thumbProps?: ScrollAreaThumbProps
  cornerProps?: ScrollAreaCornerProps
} & ScrollAreaProps

const GeneralizedScrollArea: FC<GeneralizedScrollAreaProps> = ({
  children,
  viewportProps,
  thumbProps,
  scrollbarProps,
  cornerProps,
  ...props
}) => {
  return (
    <ScrollArea {...props}>
      <ScrollAreaViewport {...viewportProps}>{children}</ScrollAreaViewport>
      <ScrollAreaScrollbar orientation="vertical" {...scrollbarProps}>
        <ScrollAreaThumb {...thumbProps} />
      </ScrollAreaScrollbar>
      <ScrollAreaScrollbar orientation="horizontal" {...scrollbarProps}>
        <ScrollAreaThumb {...thumbProps} />
      </ScrollAreaScrollbar>
      <ScrollAreaCorner />
    </ScrollArea>
  )
}

export {
  ScrollArea,
  ScrollAreaViewport,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaCorner,
  GeneralizedScrollArea,
}

export type {
  ScrollAreaProps,
  ScrollAreaViewportProps,
  ScrollAreaScrollbarProps,
  ScrollAreaThumbProps,
  ScrollAreaCornerProps,
  GeneralizedScrollAreaProps,
}
