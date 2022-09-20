import { styled } from '../../stitches.config'
import React, {
  ComponentPropsWithoutRef,
  ElementRef,
  forwardRef,
  ReactNode,
} from 'react'

const StyledInput = styled('div', {
  all: 'unset',
  width: '100%',
  padding: 16,
  borderRadius: 8,
  fontFamily: '$body',
  fontSize: 16,
  color: '$neutralText',
  backgroundColor: '$inputBackground',
  $$focusColor: '$colors$accentBorderHover',
  '&:focus': { boxShadow: '0 0 0 2px $$focusColor' },

  '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
    '-webkit-appearance': 'none',
    margin: 0,
  },
})

export const PseudoInput = forwardRef<
  ElementRef<typeof StyledInput>,
  ComponentPropsWithoutRef<typeof StyledInput> & {
    icon?: ReactNode
  }
>(({ children, icon, ...props }, forwardedRef) => (
  <StyledInput ref={forwardedRef} {...props}>
    {children}
  </StyledInput>
))

export default PseudoInput
