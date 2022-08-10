import React, { ComponentPropsWithoutRef, FC } from 'react'
import { styled } from '../../stitches.config'
import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group'

type ToggleGroupProps = ComponentPropsWithoutRef<typeof StyledToggleGroup> & {
  children: React.ReactNode
}

const StyledToggleGroup = styled(ToggleGroupPrimitive.Root, {
  p: 2,
  backgroundColor: '$neutralBgHover',
  display: 'flex',
  borderRadius: 99999,
  gap: '$1',
})

const ToggleGroup: FC<ToggleGroupProps> = ({ children, ...props }) => (
  <StyledToggleGroup {...props}>{children}</StyledToggleGroup>
)

const ToggleGroupButton = styled(ToggleGroupPrimitive.Item, {
  all: 'unset',
  cursor: 'pointer',
  backgroundColor: '$neutralBgHover',
  color: '$textColor',
  py: 8,
  px: 16,
  borderRadius: 99999,
  $$focusColor: '$colors$accentBorderHover',
  '&:hover': { backgroundColor: '$neutralBgActive' },
  '&[data-state=on]': {
    backgroundColor: '$neutralBgSubtle',
    pointerEvents: 'none',
  },
  '&:focus': { position: 'relative', boxShadow: '0 0 0 2px $$focusColor' },
})

export { ToggleGroup, ToggleGroupButton }
