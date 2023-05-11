import { faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { FC, PropsWithChildren, useEffect } from 'react'
import { Flex, Box, Text } from '../primitives'
import { CollapsibleContent, CollapsibleRoot } from '../primitives/Collapsible'
import * as CollapsiblePrimitive from '@radix-ui/react-collapsible'

type Props = {
  title?: string
  isComplete: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
} & PropsWithChildren

export const ApproveCollapsible: FC<Props> = ({
  title,
  isComplete,
  children,
  open,
  onOpenChange,
}) => {
  useEffect(() => {
    if (isComplete) {
      onOpenChange(false)
    }
  }, [isComplete])

  return (
    <CollapsibleRoot
      open={open}
      onOpenChange={onOpenChange}
      css={{ backgroundColor: '$gray3' }}
    >
      <CollapsiblePrimitive.Trigger asChild>
        <Flex justify="between" css={{ p: '$4' }}>
          <Flex align="center" css={{ gap: '$3' }}>
            <Box
              css={{
                width: 18,
                height: 18,
                backgroundColor: isComplete ? '$green6' : '$accentSolid',
                borderColor: isComplete ? '$green9' : '$accentLine',
                borderStyle: 'solid',
                borderWidth: 4,
                borderRadius: 999,
              }}
            />
            <Text
              style="subtitle2"
              css={{ color: isComplete ? '$neutralText' : '$textColor' }}
            >
              {title}
            </Text>
          </Flex>
          <Box
            css={{
              color: '$neutralSolid',
              transform: open ? 'rotate(180deg)' : 'rotate(0)',
              transition: '.3s',
            }}
          >
            <FontAwesomeIcon icon={faChevronDown} />
          </Box>
        </Flex>
      </CollapsiblePrimitive.Trigger>
      <CollapsibleContent>{children}</CollapsibleContent>
    </CollapsibleRoot>
  )
}
