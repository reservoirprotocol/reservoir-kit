import React, { FC, ReactNode } from 'react'
import { Flex, Text } from '../../primitives'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCircleCheck,
  faCircleInfo,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons'

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
          <FontAwesomeIcon icon={faCircleCheck} width="16" height="16" />
        </Text>
      )}
      {kind === 'error' && (
        <Text color="error">
          <FontAwesomeIcon
            icon={faTriangleExclamation}
            width="16"
            height="16"
          />
        </Text>
      )}
      {kind === 'warning' && (
        <Text color="error">
          <FontAwesomeIcon icon={faCircleInfo} width="16" height="16" />
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
