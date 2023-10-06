import { styled } from '../../stitches.config'
import React, {
  ComponentPropsWithoutRef,
  ElementRef,
  forwardRef,
  ReactNode,
  useState,
} from 'react'
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'

const DropdownMenuContent = styled(DropdownMenuPrimitive.DropdownMenuContent, {
  mx: '$4',
  p: '$2',
  borderRadius: 8,
  zIndex: 5,
  background: '$neutralBg',
  $$borderColor: '$colors$gray7',
  boxShadow: '0 0 0 1px $$borderColor',
})

const DropdownMenuItem = styled(DropdownMenuPrimitive.DropdownMenuItem, {
  fontSize: 16,
  fontFamily: '$body',
  color: '$gray12',
  px: '$2',
  py: '$4',
  borderRadius: 8,
  outline: 'none',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: '$gray5',
  },
  '&:focus': {
    backgroundColor: '$gray5',
  },
})

type Props = {
  trigger: ReactNode
  contentProps?: DropdownMenuPrimitive.DropdownMenuContentProps
}

const Dropdown = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.Root>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Root> & Props
>(({ children, trigger, contentProps, ...props }, forwardedRef) => {
  const [open, setOpen] = useState(false)

  return (
    <DropdownMenuPrimitive.Root {...props} open={open} onOpenChange={setOpen}>
      <DropdownMenuPrimitive.Trigger asChild>
        {trigger}
      </DropdownMenuPrimitive.Trigger>
      {open && (
        <DropdownMenuContent ref={forwardedRef} {...contentProps}>
          {children}
        </DropdownMenuContent>
      )}
    </DropdownMenuPrimitive.Root>
  )
})

export { Dropdown, DropdownMenuContent, DropdownMenuItem }
