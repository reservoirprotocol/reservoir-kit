import React, { FC } from 'react'
import { Anchor, Flex, Text } from '../../primitives'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCircleCheck,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons'

export type CartToastKind = 'success' | 'error'

type Props = {
  kind?: CartToastKind
  message: string
  link?: {
    text: string
    url: string
  }
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
      <Text css={{ ml: '$1', mt: 3 }} style="body2">
        {message}
      </Text>
      {link && (
        <Anchor
          color="primary"
          weight="medium"
          css={{ fontSize: 12, ml: 'auto', mt: 3 }}
          href={link.url}
          target="_blank"
        >
          {link.text}
        </Anchor>
      )}
    </Flex>
  )
}

export default CartToast
