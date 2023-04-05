import React, { FC, ReactNode } from 'react'
import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { keyframes, styled } from '@stitches/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown } from '@fortawesome/free-solid-svg-icons'
import Box from './Box'
import Flex from './Flex'

const AccordionRoot = styled(AccordionPrimitive.Root, {
  borderRadius: 6,
  backgroundColor: '$neutralBgHover',
  width: '100%',
})

const AccordionItem = styled(AccordionPrimitive.Item, {
  overflow: 'hidden',
  marginTop: 1,

  '&:first-child': {
    marginTop: 0,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },

  '&:last-child': {
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },

  '&:focus-within': {
    position: 'relative',
    zIndex: 1,
  },
})

const slideDown = keyframes({
  from: { height: 0 },
  to: { height: 'var(--radix-accordion-content-height)' },
})

const slideUp = keyframes({
  from: { height: 'var(--radix-accordion-content-height)' },
  to: { height: 0 },
})

const AccordionContent = styled(AccordionPrimitive.Content, {
  overflow: 'hidden',
  backgroundColor: '$neutralBg',

  '&[data-state="open"]': {
    animation: `${slideDown} 300ms cubic-bezier(0.87, 0, 0.13, 1)`,
  },
  '&[data-state="closed"]': {
    animation: `${slideUp} 300ms cubic-bezier(0.87, 0, 0.13, 1)`,
  },
})

const StyledTrigger = styled(AccordionPrimitive.Trigger, {
  all: 'unset',
  boxSizing: 'border-box',
  width: '100%',
  backgroundColor: '$neutralBgSubtle',
  padding: 20,
  height: 45,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
})

type TriggerProps = {
  children: ReactNode
  props?: AccordionPrimitive.AccordionTriggerProps
  css?: Parameters<typeof StyledTrigger>['0']['css']
}

const AccordionTrigger: FC<TriggerProps> = ({ children, props, css }) => (
  <AccordionPrimitive.Header>
    <StyledTrigger
      {...props}
      css={{
        ...css,
        transition: 'transform 300ms cubic-bezier(0.87, 0, 0.13, 1)',
        '[data-state="open"]': { transform: 'rotate(180deg)' },
      }}
      asChild
    >
      <Flex justify="between" align="center">
        {children}
        <Box
          css={{
            color: '$neutralText',
            transition: 'transform 300ms cubic-bezier(0.87, 0, 0.13, 1)',
            '[data-state="open"] &': { transform: 'rotate(180deg)' },
          }}
        >
          <FontAwesomeIcon icon={faChevronDown} />
        </Box>
      </Flex>
    </StyledTrigger>
  </AccordionPrimitive.Header>
)

export { AccordionRoot, AccordionItem, AccordionTrigger, AccordionContent }
