import { CSSProps, styled } from '../../stitches.config'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import React, { FC, ReactNode } from 'react'
import * as styles from './styles/Popover'
import { StyledComponent } from '@stitches/react/types/styled-component'

const PopoverContent = styled(PopoverPrimitive.Content, styles.content)
type PopoverContentProps = PopoverPrimitive.PopoverContentProps & CSSProps

const PopoverArrow = styled(PopoverPrimitive.Arrow, styles.arrow)
type PopoverArrowProps = PopoverPrimitive.PopoverArrowProps & CSSProps

const PopoverClose = styled(PopoverPrimitive.Close, styles.close)
type PopoverCloseProps = PopoverPrimitive.PopoverCloseProps & CSSProps

const Popover = PopoverPrimitive.Root
const PopoverTrigger = PopoverPrimitive.Trigger

const PopoverIconButton = styled('div', styles.iconButton)
type PopoverIconButtonProps = StyledComponent<'div'> & CSSProps

type GeneralizedPopoverProps = {
  trigger: { props?: PopoverPrimitive.PopoverTriggerProps; children: ReactNode }
  content: { props?: PopoverContentProps; children: ReactNode }
  arrowProps?: PopoverArrowProps
  close?: { props?: PopoverCloseProps; children?: ReactNode }
  iconButtonProps?: PopoverIconButtonProps
} & PopoverPrimitive.PopoverProps

const GeneralizedPopover: FC<GeneralizedPopoverProps> = ({
  trigger,
  content,
  arrowProps,
  close,
  iconButtonProps,
  ...props
}) => (
  <Popover {...props}>
    <PopoverTrigger {...trigger.props}>
      <PopoverIconButton {...iconButtonProps}>
        {trigger.children}
      </PopoverIconButton>
    </PopoverTrigger>
    <PopoverContent {...content?.props}>
      {content.children}
      {arrowProps && <PopoverArrow {...arrowProps} />}
    </PopoverContent>
  </Popover>
)

export {
  PopoverContent,
  PopoverArrow,
  PopoverClose,
  Popover,
  PopoverTrigger,
  PopoverIconButton,
  GeneralizedPopover,
}

export type {
  PopoverContentProps,
  PopoverArrowProps,
  PopoverCloseProps,
  PopoverIconButtonProps,
  GeneralizedPopoverProps,
}
