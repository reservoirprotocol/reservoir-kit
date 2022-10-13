import { styled } from '../../stitches.config'
import Flex from './Flex'
import Box from './Box'
import React, {
  ComponentPropsWithoutRef,
  ElementRef,
  forwardRef,
  ReactNode,
} from 'react'
import { CSS } from '@stitches/react'

const StyledInput = styled('input', {
  all: 'unset',
  width: '100%',
  px: 16,
  py: 12,
  borderRadius: 8,
  fontFamily: '$body',
  fontSize: 16,
  color: '$neutralTextContrast',
  backgroundColor: '$inputBackground',
  $$focusColor: '$colors$accentBorderHover',
  '&:placeholder': { color: '$neutralText' },
  '&:focus': { boxShadow: '0 0 0 2px $$focusColor' },

  '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
    '-webkit-appearance': 'none',
    margin: 0,
  },

  '&[type=number]': {
    '-moz-appearance': 'textfield',
  },
})

export const Input = forwardRef<
  ElementRef<typeof StyledInput>,
  ComponentPropsWithoutRef<typeof StyledInput> & {
    icon?: ReactNode
    containerCss?: CSS
    iconCss?: CSS
  }
>(({ children, icon, containerCss, iconCss, ...props }, forwardedRef) => (
  <Flex css={{ ...containerCss, position: 'relative' }}>
    {icon && (
      <Box
        css={{
          position: 'absolute',
          top: '50%',
          transform: 'translateY(-50%)',
          left: 16,
          color: '$neutralTextContrast',
          pointerEvents: 'none',
          ...iconCss,
        }}
      >
        {icon}
      </Box>
    )}
    <StyledInput
      css={{ pl: icon ? 48 : 16, ...props.css }}
      ref={forwardedRef}
      {...props}
    />
  </Flex>
))

export default Input
