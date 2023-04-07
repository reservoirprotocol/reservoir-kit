import React, { useEffect } from 'react'
import { keyframes, styled } from '@stitches/react'
import * as CollapsiblePrimitive from '@radix-ui/react-collapsible'
import {
  ComponentPropsWithoutRef,
  ElementRef,
  forwardRef,
  ReactNode,
  useState,
} from 'react'

const slideDown = keyframes({
  from: { height: 0 },
  to: { height: 'var(--radix-collapsible-content-height)' },
})

const slideUp = keyframes({
  from: { height: 'var(--radix-collapsible-content-height)' },
  to: { height: 0 },
})

const CollapsibleContent = styled(CollapsiblePrimitive.CollapsibleContent, {
  background: 'transparent',
  border: 'none',
  borderRadius: 0,
  '&[data-state="open"]': {
    animation: `${slideDown} 300ms cubic-bezier(0.87, 0, 0.13, 1)`,
  },
  '&[data-state="closed"]': {
    animation: `${slideUp} 300ms cubic-bezier(0.87, 0, 0.13, 1)`,
  },
})

const CollapsibleRoot = styled(CollapsiblePrimitive.Root, {
  borderRadius: 8,
  overflow: 'hidden',
})

type Props = {
  trigger: ReactNode
  contentProps?: CollapsiblePrimitive.CollapsibleContentProps
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const Collapsible = forwardRef<
  ElementRef<typeof CollapsiblePrimitive.Content>,
  ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Content> & Props
>(
  (
    { children, trigger, contentProps, open, onOpenChange, ...props },
    forwardedRef
  ) => {
    const [collapsibleOpen, setCollapsibleOpen] = useState(false)

    useEffect(() => {
      if (open !== undefined && open !== collapsibleOpen) {
        setCollapsibleOpen(open)
        if (onOpenChange) {
          onOpenChange(open)
        }
      }
    }, [open])

    return (
      <CollapsibleRoot
        {...props}
        onOpenChange={(open) => {
          setCollapsibleOpen(open)
          if (onOpenChange) {
            onOpenChange(open)
          }
        }}
        open={collapsibleOpen}
      >
        <CollapsiblePrimitive.Trigger asChild>
          {trigger}
        </CollapsiblePrimitive.Trigger>
        <CollapsibleContent ref={forwardedRef} {...contentProps}>
          {children}
        </CollapsibleContent>
      </CollapsibleRoot>
    )
  }
)

export { Collapsible, CollapsibleContent, CollapsibleRoot }
