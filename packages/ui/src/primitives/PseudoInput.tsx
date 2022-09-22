import { styled } from '../../stitches.config'

const PseudoInput = styled('div', {
  all: 'unset',
  width: 'auto',
  padding: '$4',
  borderRadius: '$2',
  fontFamily: '$body',
  fontSize: 16,
  fontWeight: 400,
  color: '$neutralText',
  backgroundColor: '$inputBackground',
  $$focusColor: '$colors$accentBorderHover',
  '&:focus': { boxShadow: '0 0 0 2px $$focusColor' },

  '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
    '-webkit-appearance': 'none',
    margin: 0,
  },
})

export default PseudoInput
