import { styled } from '../../stitches.config'

const Divider = styled('hr', {
  width: '100%',
  height: '1px',
  borderWidth: 0,
  backgroundColor: '$neutralLine',
  variants: {
    direction: {
      vertical: {
        height: '100%',
        maxHeight: 16,
        minHeight: 12,
        width: 1,
        margin: '0 5px',
      },
    },
  },
})

export default Divider
