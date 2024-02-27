import React, { FC, ReactNode } from 'react'
import { Flex, Text } from '../../primitives'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export type CartToastKind = 'success' | 'error' | 'warning'

type Props = {
  kind?: CartToastKind
  message: string
  link?: ReactNode
}

const CartToast: FC<Props> = ({ kind = 'success', message, link }) => {
  return (
    <Flex
      css={{
        width: '100%',
        background: '$wellBackground',
        p: '$2',
        borderRadius: '$borderRadius',
        mb: '$2',
      }}
    >
      {kind === 'success' && (
        <Text color="success">
          <FontAwesomeIcon icon={'circle-check'} width="16" height="16" />
        </Text>
      )}
      {kind === 'error' && (
        <Text color="error">
          <FontAwesomeIcon icon="triangle-exclamation" width="16" height="16" />
        </Text>
      )}
      {kind === 'warning' && (
        <Text color="error">
          <FontAwesomeIcon icon={'circle-info'} width="16" height="16" />
        </Text>
      )}
      <Text css={{ ml: '$1', mt: 3 }} style="body3">
        {message}
      </Text>
      {link}
    </Flex>
  )
}

export default CartToast
