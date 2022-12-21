import { styled } from '../../stitches.config'

const Button = styled('button', {
  backgroundColor: 'transparent',
  backgroundImage: 'none',
  outline: 'none',
  fontWeight: 700,
  fontSize: 16,
  fontFamily: '$button',
  transition: 'background-color 250ms linear',
  gap: '$space$2',
  display: 'inline-flex',
  justifyContent: 'center',
  color: '$buttonTextColor',
  alignItems: 'center',
  lineHeight: '20px',
  $$focusColor: '$colors$focusColor',
  cursor: 'pointer',
  border: 0,
  borderWidth: 0,
  '&:focus-visible': {
    boxShadow: '0 0 0 2px $$focusColor',
  },
  '&:disabled': {
    backgroundColor: '$neutralBorder',
    color: '$neutralText',
    cursor: 'default',
  },
  '&:disabled:hover': {
    backgroundColor: '$neutralBorderHover',
    color: '$neutralText',
    cursor: 'default',
  },
  variants: {
    color: {
      primary: {
        backgroundColor: '$accentSolid',
        color: '$buttonTextColor',
        '&:hover': {
          backgroundColor: '$accentSolidHover',
          color: '$buttonTextHoverColor',
        },
      },
      secondary: {
        backgroundColor: '$neutralBgHover',
        color: '$textColor',
        '&:hover': {
          backgroundColor: '$neutralBgActive',
        },
      },
      ghost: {
        backgroundColor: 'transparent',
        p: 0,
      },
    },
    corners: {
      rounded: {
        borderRadius: '$borderRadius',
      },
      pill: {
        borderRadius: 99999,
      },
      circle: {
        borderRadius: '99999px',
        alignItems: 'center',
        justifyContent: 'center',
      },
    },
    size: {
      none: {},
      xs: {
        p: '$space$3',
        lineHeight: '16px',
        minHeight: 40,
      },
      small: {
        px: '$space$3',
        py: '$space$4',
        lineHeight: '12px',
        minHeight: 44,
      },
      medium: {
        px: '$space$5',
        py: '$space$3',
        minHeight: 44,
      },
      large: {
        px: '$space$5',
        py: '$space$4',
        minHeight: 52,
      },
    },
  },
  compoundVariants: [
    {
      size: 'xs',
      corners: 'circle',
      css: {
        height: 40,
        width: 40,
        p: 0,
      },
    },
    {
      size: 'small',
      corners: 'circle',
      css: {
        height: 44,
        width: 44,
        p: 0,
      },
    },
    {
      size: 'medium',
      corners: 'circle',
      css: {
        height: 44,
        width: 44,
        p: 0,
      },
    },
    {
      size: 'large',
      corners: 'circle',
      css: {
        height: 52,
        width: 52,
        p: 0,
      },
    },
  ],
  defaultVariants: {
    color: 'primary',
    corners: 'rounded',
    size: 'medium',
  },
})

export default Button
