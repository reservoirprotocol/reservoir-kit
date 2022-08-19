import { styled } from '../../stitches.config'
import Input from './Input'

const StyledDateInput = styled(Input, {
  '&::-webkit-calendar-picker-indicator': {
    background: 'transparent',
    bottom: 0,
    color: 'transparent',
    cursor: 'pointer',
    height: 'auto',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    width: 'auto',
  },
})

export default StyledDateInput
