import React, { ComponentPropsWithoutRef } from 'react'
import { styled } from '../../stitches.config'
import * as Select from '@radix-ui/react-select'
import { faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Box from './Box'

type Props = {
  children: React.ReactNode
}

type SelectProps = {
  Item: typeof Select.Item
  ItemText: typeof Select.ItemText
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
  backgroundColor: '$inputBackground',
  color: '$textColor',
  p: '$4',
  borderRadius: '$borderRadius',
})

export const RKSelect: React.FC<
  Props &
    ComponentPropsWithoutRef<typeof Select.Root> &
    ComponentPropsWithoutRef<typeof Select.Value>
> &
  SelectProps = ({ children, ...props }) => (
  <Select.Root {...props}>
    <StyledTrigger>
      <Select.Value placeholder={props.placeholder}>{props.value}</Select.Value>
      <Select.Icon asChild>
        <Box css={{ color: '$neutralSolidHover' }}>
          <FontAwesomeIcon icon={faChevronDown} width="14" color="" />
        </Box>
      </Select.Icon>
    </StyledTrigger>
    <Select.Portal style={{ zIndex: 1000000 }}>
      <StyledContent>
        <Select.Viewport>{children}</Select.Viewport>
      </StyledContent>
    </Select.Portal>
  </Select.Root>
)

const StyledItem = styled(Select.Item, {
  cursor: 'pointer',
})

RKSelect.Item = StyledItem
RKSelect.ItemText = Select.ItemText

export default RKSelect
