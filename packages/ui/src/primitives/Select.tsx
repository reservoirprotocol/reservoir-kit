import React, { ComponentPropsWithoutRef } from 'react'
import { styled } from '../../stitches.config'
import * as Select from '@radix-ui/react-select'
import Text from './Text'
import { faLeftLong } from '@fortawesome/free-solid-svg-icons'

type Props = {
  children: React.ReactNode
}

type SelectProps = {
  Item: typeof Select.Item
}

const StyledTrigger = styled(Select.Trigger, {
  width: '100%',
  px: '$4',
  py: '$3',
  borderRadius: '$borderRadius',
  fontfamily: '$body',
  fontSize: 16,
  display: 'flex',
  justifyContent: 'space-between',
  color: '$neutralTextContrast',
  backgroundColor: '$inputBackground',
  $$focusColor: '$colors$accentBorderHover',
  '&:placeholder': { color: '$neutralText' },
  '&:focus': { boxShadow: '0 0 0 2px $$focusColor' },
})

const StyledContent = styled(Select.Content, {
  top: 0,
  left: 0,
  backgroundColor: 'black',
  color: 'white',
  p: '$4',
})

const RKSelect: React.FC<Props & ComponentPropsWithoutRef<typeof Select.Root>> &
  SelectProps = ({ children, ...props }) => (
  <Select.Root {...props} open={true}>
    <StyledTrigger>
      <Select.Value placeholder="select expiration">{props.value}</Select.Value>
      <Select.Icon />
    </StyledTrigger>
    <Select.Portal>
      <StyledContent>
        <Select.Viewport>{children}</Select.Viewport>
      </StyledContent>
    </Select.Portal>
  </Select.Root>
)

RKSelect.Item = Select.Item

export default RKSelect
