import { faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { FC, PropsWithChildren, useEffect } from 'react'
import { Flex, Box, Text } from '../primitives'
import { CollapsibleContent, CollapsibleRoot } from '../primitives/Collapsible'
import * as CollapsiblePrimitive from '@radix-ui/react-collapsible'
import { CSS } from '@stitches/react'

type Props = {
  title?: string
  isInProgress?: boolean
  isComplete: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
  css?: CSS
} & PropsWithChildren

export const ApproveCollapsible: FC<Props> = ({
  title,
  isInProgress,
  isComplete,
  children,
  open,
  css,
  onOpenChange,
}) => {
  useEffect(() => {
    if (isComplete) {
      onOpenChange(false)
    }
  }, [isComplete])

  let backgroundColor = 'transparent'
  let borderColor = '$neutralLine'

  if (isComplete) {
    backgroundColor = '$green6'
    borderColor = '$green9'
  } else if (isInProgress) {
    backgroundColor = '$accentSolid'
    borderColor = '$accentLine'
  }

  return (
    <CollapsibleRoot
      open={open}
      onOpenChange={onOpenChange}
      css={{ backgroundColor: '$gray3', ...css }}
    >
      <CollapsiblePrimitive.Trigger asChild>
        <Flex justify="between" css={{ p: '$4' }}>
          <Flex align="center" css={{ gap: '$3' }}>
            <Box
              css={{
                width: 18,
                height: 18,
                backgroundColor: backgroundColor,
                borderColor: borderColor,
                borderStyle: 'solid',
                borderWidth: 4,
                borderRadius: 999,
              }}
            />
            <Text
              style="subtitle3"
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
