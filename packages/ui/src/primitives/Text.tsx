import { styled } from '../../stitches.config'

export default styled('span', {
  color: '$textColor',
  fontFamily: '$body',
  letterSpacing: 0,
  margin: 0,

  variants: {
    color: {
      base: {
        color: '$textColor',
      },
      subtle: {
        color: '$neutralText',
      },
      error: {
        color: '$errorAccent',
      },
      errorLight: {
        color: '$errorText',
      },
      accent: {
        color: '$accentText',
      },
      success: {
        color: '$successAccent',
      },
      button: {
        color: '$buttonTextColor',
      },
    },
    style: {
      h2: {
        fontWeight: 700,
        fontSize: 48,
        fontFamily: '$headline',
      },
      h3: {
        fontWeight: 700,
        fontSize: 32,
        fontFamily: '$headline',
      },
      h4: {
        fontWeight: 700,
        fontSize: 24,
        fontFamily: '$headline',
      },
      h5: {
        fontWeight: 700,
        fontSize: 20,
        fontFamily: '$headline',
      },
      h6: {
        fontWeight: 700,
        fontSize: 16,
        fontFamily: '$headline',
      },
      subtitle1: {
        fontWeight: 500,
        fontSize: 16,
      },
      subtitle2: {
        fontWeight: 500,
        fontSize: 12,
      },
      body1: {
        fontWeight: 400,
        fontSize: 16,
      },
      body2: {
        fontWeight: 400,
        fontSize: 14,
      },
      body3: {
        fontWeight: 400,
        fontSize: 12,
      },
      tiny: {
        fontWeight: 500,
        fontSize: 10,
        color: '$neutralSolidHover',
      },
    },
    italic: {
      true: {
        fontStyle: 'italic',
      },
    },
    ellipsify: {
      true: {
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
      },
    },
  },
  compoundVariants: [
    {
      style: 'tiny',
      color: 'base',
      css: {
        color: '$textColor',
      },
    },
  ],
  defaultVariants: {
    style: 'body1',
    color: 'base',
  },
})
