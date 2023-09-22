import React, { ComponentPropsWithoutRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Flex from './Flex'
import Text from './Text'
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons'

type Props = {
  error?: Error
} & Pick<ComponentPropsWithoutRef<typeof Flex>, 'css'>

export default function ErrorWell({ error, css }: Props) {
  let message = 'Oops, something went wrong. Please try again.'

  if (error) {
    if (error.message.includes('rejected')) {
      message = 'User rejected the request.'
    }
  }

  return (
    <Flex
      css={{
        color: '$errorAccent',
        p: '$4',
        gap: '$2',
        background: '$wellBackground',
        ...css,
      }}
      align="center"
    >
      <FontAwesomeIcon icon={faCircleExclamation} width={16} height={16} />
      <Text style="body3" color="errorLight">
        {message}
      </Text>
    </Flex>
  )
}
