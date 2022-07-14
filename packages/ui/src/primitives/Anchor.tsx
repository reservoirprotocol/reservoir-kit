import React, { ElementRef, forwardRef, ComponentPropsWithoutRef } from 'react'
import { styled } from '../../stitches.config'

export const StyledAnchor = styled('a', {
  cursor: 'pointer',
  fontFamily: '$body',
  fontSize: 16,
  $$focusColor: '$colors$neutralTextContrast',
  '&:focus-visible': {
    color: '$neutralTextContrast',
    outline: 'none',
    borderRadius: 4,
    boxShadow: '0 0 0 2px $$focusColor',
  },
  variants: {
    color: {
      primary: {
        color: '$accentText',
        '&:hover': {
          color: '$accentSolidHover',
        },
      },
      gray: {
        color: '$neutralText',
        '&:hover': {
          color: '$accentText',
        },
      },
    },
    weight: {
      heavy: {
        fontWeight: 700,
      },
      medium: {
        fontWeight: 500,
      },
    },
  },
  defaultVariants: {
    color: 'gray',
    weight: 'heavy',
  },
})

export default forwardRef<
  ElementRef<typeof StyledAnchor>,
  ComponentPropsWithoutRef<typeof StyledAnchor>
>(({ children, ...props }, forwardedRef) => (
  <StyledAnchor ref={forwardedRef} {...props} tabIndex={0}>
    {children}
  </StyledAnchor>
))
